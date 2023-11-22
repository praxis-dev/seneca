import React, { useState, useEffect } from "react";

import { useResponsiveStyles } from "../../library/hooks";
import { Breakpoint, ViewStyles } from "../../library/styles";

import { Row, Col, Space, Modal } from "antd";

import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useDispatch } from "react-redux";
import { setFormState } from "../../store/slices/formSlice";

import BasicForm from "../../components/BasicForm/BasicForm";

import PulsatingButtonWithText from "../../components/PulsatingButtonWithText/PulsatingButtonWithText";

const Landing: React.FC = () => {
  const styles = useResponsiveStyles(baseStyles, {
    [Breakpoint.ExtraLarge]: extraLargeScreenStyles,
    [Breakpoint.Large]: largeScreenStyles,
    [Breakpoint.Medium]: mediumScreenStyles,
    [Breakpoint.Small]: smallScreenStyles,
    [Breakpoint.ExtraSmall]: extraSmallScreenStyles,
  });

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);

  const dispatch = useDispatch();

  const formState = useSelector((state: RootState) => state.form.form);

  useEffect(() => {
    if (formState === "noform") {
      setIsLoginModalVisible(false);
      setIsSignupModalVisible(false);
    }
  }, [formState]);

  const signupModalTitle =
    formState === "signup"
      ? "Sign Up"
      : formState === "recover"
      ? "Recover Password"
      : "Login";

  const loginModalTitle =
    formState === "login"
      ? "Login"
      : formState === "recover"
      ? "Recover Password"
      : "Login";

  const showLoginModal = () => {
    dispatch(setFormState("login"));
    setIsLoginModalVisible(true);
  };

  const showSignupModal = () => {
    dispatch(setFormState("signup"));
    setIsSignupModalVisible(true);
  };

  const handleLoginOk = () => {
    dispatch(setFormState("noform"));
    setIsLoginModalVisible(false);
  };

  const handleSignupOk = () => {
    dispatch(setFormState("noform"));
    setIsSignupModalVisible(false);
  };

  return (
    <div>
      <Row>
        <Col span={24} style={styles.test}>
          <Space direction="vertical" style={styles.contentSpace}>
            <h1>QuestMind.AI</h1>
            <h2>
              Unlock Your Potential with Our AI-Powered Psychological Advisor
            </h2>
            <div style={styles.textArea}>
              Welcome to the forefront of personal growth and mental well-being.
              Our cutting-edge psychological AI advisor is tailored to
              understand and guide you through life's complexities.
            </div>
            <div style={styles.textArea}>
              Experience personalized insights and advice, crafted by the
              synergy of advanced AI and psychological expertise.
            </div>

            <div style={styles.textArea}>
              Join our community today and embark on a transformative journey
              towards a more insightful, balanced you.
            </div>
            <Space direction="horizontal" style={styles.contentSpace}>
              <PulsatingButtonWithText
                disabled={false}
                onClick={showLoginModal}
              >
                Login
              </PulsatingButtonWithText>
              <Modal
                style={{ top: 20 }}
                title={loginModalTitle}
                open={isLoginModalVisible}
                onOk={handleLoginOk}
                onCancel={() => setIsLoginModalVisible(false)}
                footer={[null]}
              >
                <BasicForm />
              </Modal>

              <PulsatingButtonWithText
                disabled={false}
                onClick={showSignupModal}
              >
                Sign Up
              </PulsatingButtonWithText>
              <Modal
                style={{ top: 20 }}
                title={signupModalTitle}
                open={isSignupModalVisible}
                onOk={handleSignupOk}
                onCancel={() => setIsSignupModalVisible(false)}
                footer={[null]}
              >
                <BasicForm />
              </Modal>
            </Space>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

const baseStyles: ViewStyles = {
  test: {
    height: "100vh",
  },

  contentSpace: {
    margin: "auto auto",
    boxSizing: "border-box",
    padding: "20px",
    maxWidth: "800px",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  textArea: {
    textAlign: "left",
  },
};

const extraLargeScreenStyles: ViewStyles = {};

const largeScreenStyles: ViewStyles = {};

const mediumScreenStyles: ViewStyles = {};

const smallScreenStyles: ViewStyles = {};

const extraSmallScreenStyles: ViewStyles = {};

export default Landing;
