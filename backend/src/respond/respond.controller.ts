//respond.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Delete,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Types } from 'mongoose';

import { Dialogue } from './entities/dialogue.entity';
import { User } from '../users/entities/user.entity';

import { WsGateway } from '../websockets/ws.gateway';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('respond')
export class RespondController {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel('Dialogue') private dialogueModel: Model<Dialogue>,
    private jwtService: JwtService,
    private wsGateway: WsGateway,
  ) {}
  
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async respond(
    @Body() body: { question: string; dialogueId: string },
    @Req() req: RequestWithUser,
  ): Promise<any> {
    try {
      const user = req.user;
  
      const apiEndpoint = process.env.API_ENDPOINT;
      if (!apiEndpoint) {
        throw new Error('API_ENDPOINT is not defined in the environment');
      }
  
      let dialogue;
      if (body.dialogueId) {
        const objectId = new Types.ObjectId(body.dialogueId);
        dialogue = await this.dialogueModel.findById(objectId);
        if (!dialogue) {
          throw new NotFoundException('Dialogue not found');
        }
      } else {
        // Create a new dialogue if no dialogueId is provided
        dialogue = await this.dialogueModel.create({
          userId: user._id,
          messages: [],
          isBranch: false,
          parentDialogueId: null,
          updatedAt: new Date(),
        });
      }
  
      // Combine history and query into a single string
      const combinedInput = dialogue.messages.map(msg => `${msg.sender}: ${msg.message}`).join('\n') + `\nuser: ${body.question}`;
      console.log(combinedInput);
      const response = await firstValueFrom(
        this.httpService.post(
          apiEndpoint,
          { query: combinedInput },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );
  
      // Update the dialogue with the new question and AI response
      dialogue.messages.push(
        {
          sender: 'user',
          message: body.question,
          timestamp: new Date(),
          important: false,
        },
        {
          sender: 'ai',
          message: response.data,
          timestamp: new Date(),
          important: false,
        },
      );
      dialogue.updatedAt = new Date();
      await dialogue.save();
      this.wsGateway.notifyClient(dialogue._id.toString(), {
        updatedAt: dialogue.updatedAt,
      });
  
      return { data: response.data, dialogueId: dialogue._id.toString() };
    } catch (error) {
      throw new InternalServerErrorException('Model communication failed.');
    }
  }
  

  @UseGuards(AuthGuard('jwt'))
  @Get('/dialogues')
  async getUserDialogues(@Req() req: RequestWithUser): Promise<any> {
    try {
      const userId = req.user._id;

      const dialogues = await this.dialogueModel.find({ userId: userId });
      const dialogueSummaries = dialogues.map((dialogue) => {
        return {
          dialogueId: dialogue._id.toString(),
          firstMessage: dialogue.messages[0]?.message || 'No messages',
          createdAt: dialogue.createdAt,
          updatedAt: dialogue.updatedAt,
        };
      });

      return dialogueSummaries;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch dialogues.');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/dialogue/:dialogueId')
  async getDialogueById(@Param('dialogueId') dialogueId: string): Promise<any> {
    try {
      const objectId = new Types.ObjectId(dialogueId);
      const dialogue = await this.dialogueModel.findOne({ _id: objectId });
      if (!dialogue) {
        throw new NotFoundException('Dialogue not found');
      }

      return dialogue;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch dialogue.');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('jwt'))
  @Delete('/dialogue/:dialogueId')
  async deleteDialogue(
    @Param('dialogueId') dialogueId: string,
    @Req() req: RequestWithUser,
  ): Promise<any> {
    try {
      const userId = req.user._id;
      const objectId = new Types.ObjectId(dialogueId);

      const result = await this.dialogueModel.deleteOne({
        _id: objectId,
        userId: userId,
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException(
          'Dialogue not found or user not authorized to delete this dialogue',
        );
      }

      return { message: 'Dialogue deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete dialogue.');
    }
  }
}
