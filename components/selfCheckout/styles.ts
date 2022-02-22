import Theme from "../../styles";

export const scoMainScreenStyles = () => {
  const { colors, fonts, miscellaneous, padding, textAlign } = Theme.styles;

  return {
    root: {
      ...miscellaneous.fill,
      paddingTop: padding.lg,
      paddingHorizontal: padding.lg,
      paddingBottom: padding.xl,
      backgroundColor: colors.lightGrey
    },
    topButtonArea: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: padding.xs
    },
    toggleButton: {
      justifyContent: "center",
      alignItems: "center"
    },
    toggleButtonNoLogo: {
      paddingVertical: padding.sm,
      paddingHorizontal: padding.xl
    },
    logoArea: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    logo: {
      width: 91,
      height: 40,
      resizeMode: "contain"
    },
    helpButton: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: padding.sm,
      paddingHorizontal: padding.xl,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.black
    },
    helpText: {
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.semiBold
    },
    helpPopUpArea: {
      ...miscellaneous.fill,
      justifyContent: "flex-start",
      alignItems: "center",
      padding: padding.xl
    },
    title: {
      fontSize: fonts.fontSize.lg + 8,
      fontWeight: fonts.fontWeight.bold
    },
    subtitleParent: {
      marginTop: padding.xl * 2
    },
    subtitle: {
      ...textAlign.tac,
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.light
    },
    popUpBase: {
      ...miscellaneous.fill,
      alignItems: "center",
      padding: padding.xl
    },
    sessionPopUpTitle: {
      color: colors.loginAndHeaderText,
      fontSize: fonts.fontSize.lg + 2,
      fontWeight: fonts.fontWeight.bold,
      marginTop: padding.xs
    },
    sessionPopUpDescriptionText: {
      color: colors.loginAndHeaderText,
      fontSize: fonts.fontSize.lg - 10,
      marginTop: padding.xs + 25,
      fontWeight: fonts.fontWeight.bold
    },
    closeHelpButton: {
      alignSelf: "stretch",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: padding.md,
      marginHorizontal: padding.xl,
      backgroundColor: colors.black,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 5,
      marginTop: padding.xl * 2
    },
    closeHelpButtonText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    },
    timer: {
      ...textAlign.tac,
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.light
    },
    resumeButton: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: padding.md,
      paddingHorizontal: padding.xl * 2,
      backgroundColor: colors.black,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 5,
      marginTop: padding.xl * 2
    },
    resumeButtonText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    }
  };
};

export const selfCheckoutActionButtons = () => {
  const { padding, colors, fonts } = Theme.styles;

  return {
    backButton: {
      justifyContent: "center",
      alignItems: "center",
      marginRight: padding.xs,
      paddingVertical: padding.md,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 5
    },
    backText: {
      color: colors.black,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    },
    continueButton: {
      justifyContent: "center",
      alignItems: "center",
      marginLeft: padding.xs,
      paddingVertical: padding.md,
      backgroundColor: colors.black,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 5
    },
    continueText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    }
  };
};

export const selfCheckoutBagFeeScreenStyles = () => {
  const { padding, colors, fonts, miscellaneous } = Theme.styles;
  const { backButton, backText, continueButton, continueText} = selfCheckoutActionButtons();
  return {
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      flexDirection: "column"
    },
    bagFeesMainView: {
      flex: 1,
      justifyContent: "center",
      alignItem: "center",
      alignSelf: "stretch",
      padding: padding.sm,
      backgroundColor: colors.white,
      marginTop: padding.sm,
      marginBottom: padding.sm
    },
    addBagRapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center"
    },
    basketIcon: {
      fontSize: 150
    },
    addToBagTexts: {
      flexDirection: "column",
      padding: padding.xs
    },
    addBagText: {
      fontSize: fonts.fontSize.xl,
      fontWeight: fonts.fontWeight.light
    },
    bagFeetext: {
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.semibold
    },
    amountTextBagFee: {
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.regular
    },
    quantityText: {
      fontSize: fonts.fontSize.xxl,
      fontWeight: fonts.fontWeight.light
    },
    rapperQuantity: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end"
    },
    footerOptionsBagFees: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "flex-end"
    },
    actionButtons: {
      width: "50%",
      flexDirection: "row"
    },
    backText,
    continueText,
    backButton: {
      ...backButton,
      flex: 1
    },
    continueButton: {
      ...continueButton,
      flex: 2
    },
    // Adder subtractor Styles
    buttonArea: {
      borderColor: colors.darkerGrey,
      paddingHorizontal: padding.xl,
      paddingVertical: padding.sm + 2
    },
    iconText: {
      fontSize: fonts.fontSize.lg,
      color: colors.darkerGrey
    }
  };
};

export const memberScreenStyles = () => {
  const {  colors, fonts, miscellaneous, padding, textAlign } = Theme.styles;
  const { backButton, backText, continueButton, continueText} = selfCheckoutActionButtons();

  return {
    root: {
      ...miscellaneous.fill,
      flexDirection: "row"
    },
    leftSide: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginRight: padding.sm,
      backgroundColor: colors.white
    },
    rightSide: {
      flex: 1,
      marginLeft: padding.sm,
      backgroundColor: colors.lightGrey
    },
    image: {
      height: 420,
      width: 240,
      resizeMode: "contain",
      paddingVertical: padding.xl
    },
    textArea: {
      ...miscellaneous.fill,
      justifyContent: "center",
      paddingLeft: padding.xl,
      backgroundColor: "#f5e6e0" // FIXME: Make this color configurable
    },
    subtitle: {
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.semiBold
    },
    title: {
      fontSize: fonts.fontSize.xl,
      fontWeight: fonts.fontWeight.bold,
      marginVertical: padding.lg
    },
    bulletPoint: {
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.bold
    },
    infoText: {
      fontSize: fonts.fontSize.bt
    },
    buttonArea: {
      flexDirection: "row",
      width: "100%",
      marginTop: padding.sm
    },
    backText,
    continueText,
    backButton: {
      ...backButton,
      flex: 1
    },
    continueButton: {
      ...continueButton,
      flex: 2
    },
    helpPopUpArea: {
      ...miscellaneous.fill,
      justifyContent: "center",
      alignItems: "center",
      padding: padding.xl
    },
    popUpTitle: {
      fontSize: fonts.fontSize.lg + 8,
      fontWeight: fonts.fontWeight.bold
    },
    popUpSubtitleParent: {
      marginTop: padding.xl * 2
    },
    popUpSubtitle: {
      ...textAlign.tac,
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey,
      fontWeight: fonts.fontWeight.light
    },
    popUpSubtitleBold: {
      ...textAlign.tac,
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey,
      fontWeight: fonts.fontWeight.bold
    },
    closePopUpButton: {
      alignSelf: "stretch",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: padding.md,
      marginHorizontal: padding.xl,
      backgroundColor: colors.darkerGrey,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 5,
      marginTop: padding.xl * 2
    },
    closePopUpButtonText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    }
  };
};

export const paymentStyles = () => {
  const { colors, fonts, miscellaneous, padding, textAlign, buttons } = Theme.styles;

  return {
    ...buttons,
    root: {
      ...miscellaneous.fill,
      flexDirection: "row"
    },
    leftSide: {
      ...miscellaneous.fill,
      marginRight: padding.sm
    },
    rightSide: {
      ...miscellaneous.fill,
      flexDirection: "column-reverse",
      marginLeft: padding.sm
    },
    memberPresentArea: {
      ...miscellaneous.fill,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5e6e0" // FIXME: Make this color configurable
    },
    membershipExplanation: {
      ...textAlign.tac,
      fontSize: fonts.fontSize.bt,
      lineHeight: 40
    },
    membershipExplanationEmphasis: {
      ...textAlign.tac,
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.bold,
      lineHeight: 40
    },
    agreementText: {
      marginTop: padding.sm
    },
    agreementEmphasisText: {
      fontWeight: fonts.fontWeight.bold
    },
    buttonArea: {
      flexDirection: "row",
      width: "100%",
      marginTop: padding.sm
    },
    backButton: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginRight: padding.xs,
      paddingVertical: padding.md,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 5
    },
    backText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    },
    continueButton: {
      flex: 2,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: padding.xs,
      paddingVertical: padding.md,
      backgroundColor: colors.black,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 5
    },
    continueText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    }
  };
};

export const paymentSummaryStyles = () => {
  const { colors, fonts, miscellaneous, padding, textAlign, buttons } = Theme.styles;
  const { backButton, backText, continueButton, continueText } = selfCheckoutActionButtons();
  return {
    ...buttons,
    root: {
      ...miscellaneous.fill,
      flexDirection: "row"
    },
    leftSide: {
      ...miscellaneous.fill,
      marginRight: padding.sm
    },
    rightSide: {
      ...miscellaneous.fill,
      flexDirection: "column-reverse",
      marginLeft: padding.sm
    },
    paymentSummaryArea: {
      ...miscellaneous.fill,
      backgroundColor: colors.lighterGrey,
      paddingTop: padding.md,
      paddingLeft: padding.xl,
      paddingRight: padding.xl,
      paddingBottom: padding.md
    },
    paymentTypeButtonsArea: {
      flexDirection: "column",
      width: "100%",
      height: "74%"
    },
    paymentTypeButton: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: padding.lg,
      paddingHorizontal: padding.xl * 3,
      borderRadius: padding.xs,
      borderWidth: 1
    },
    buttonArea: {
      flexDirection: "row",
      width: "100%",
      marginTop: padding.sm
    },
    backButton: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginRight: padding.xs,
      paddingVertical: padding.lg,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 1
    },
    backText,
    cardPaymentButton: {
      justifyContent: "center",
      alignItems: "center",
      marginLeft: padding.xs,
      marginBottom: padding.sm,
      paddingVertical: padding.lg,
      backgroundColor: colors.black,
      borderColor: colors.darkerGrey,
      borderWidth: 1,
      borderRadius: 1
    },
    cardPaymentButtonText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.bold
    },
    giftCardPaymentButton: {
      justifyContent: "center",
      alignItems: "center",
      marginLeft: padding.xs,
      paddingVertical: padding.lg,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 1
    },
    giftCardPaymentButtonText: {
      color: colors.black,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.bold
    },
    continueButton: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: padding.xs,
      paddingVertical: padding.md,
      backgroundColor: colors.black,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 1
    },
    continueText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.bold
    },
    popUpBase: {
      ...miscellaneous.fill,
      justifyContent: "flex-start",
      alignItems: "center",
      padding: padding.xl
    },
    popupTitle: {
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.bold,
      color: colors.black,
      marginBottom: padding.xxl
    },
    title: {
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.regular,
      color: colors.black,
      marginBottom: padding.sm + padding.xxs
    },
    scanTitle: {
      fontWeight: fonts.fontWeight.bold,
      fontSize: fonts.fontSize.xl
    },
    popupMainText: {
      flex: 1,
      width: "100%",
      fontWeight: fonts.fontWeight.light,
      color: colors.darkerGrey
    },
    totalSavingsRow: {
      flex: 2,
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.light,
      width: "100%",
      position: 'absolute',
      bottom: 20,
      left: 40
    },
    textRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: padding.sm + padding.xxs
    },
    underline: {
      width: "100%",
      height: 1,
      backgroundColor: colors.darkerGrey,
      marginBottom: padding.sm
    },
    generalText: {
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.light
    },
    generalTextWithBold: {
      fontSize: fonts.fontSize.xl - 5,
      fontWeight: fonts.fontWeight.semibold
    },
    subtitle: {
      ...textAlign.tac,
      color: colors.black,
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.Regular
    },
    subtitleBold: {
      ...textAlign.tac,
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.bold
    },
    redeemScanTextArea: {
      backgroundColor: colors.white,
      alignItems: "center"
    },
    redeemTextArea: {
      ...miscellaneous.fill,
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: padding.md
    },
    redeemContinueButton: {
      ...continueButton,
      flex: 2
    },
    redeemBackText: {
      ...backText
    },
    redeemContinueText: {
      ...continueText
    },
    redeemBackButton: {
      ...backButton,
      flex: 1
    },
    iconArea: {
      flexDirection: "row",
      paddingTop: padding.md
    },
    icon: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: padding.sm
    },
    scannerIcon: {
      borderColor: colors.black,
      strokeWidth: 5,
      color: colors.white,
      height: padding.xxl * 4,
      width: padding.xxl * 4
    }
  };
};

export const scoRedeemStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;
  const { backButton, backText} = selfCheckoutActionButtons();

  return {
    rightSide: {
      ...miscellaneous.fill,
      flexDirection: "column-reverse",
      marginLeft: padding.sm
    },
    redeemKeyTextArea: {
      backgroundColor: "#f5e6e0" // FIXME: Make this color configurable
    },
    redeemTextArea: {
      ...miscellaneous.fill,
      flex: 1,
      paddingHorizontal: padding.md
    },
    field: {
      alignSelf: "stretch",
      paddingVertical: padding.md
    },
    fieldInput: {
      alignSelf: "stretch",
      fontSize: fonts.fontSize.lg,
      height: "75"
    },
    applyButton: {
      ...backButton,
      marginRight: 0
    },
    applyButtonArea: {
      paddingTop: padding.sm
    },
    applyButtonText: {
      ...backText
    },
    redeemArea: {
      flex: 1,
      justifyContent: "center"
    },
    redeemBackButton: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginRight: padding.xs,
      paddingVertical: padding.lg,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 3
    },
    redeemBackText: {
      ...backText
    },
    continueButton: {
      justifyContent: "center",
      alignItems: "center",
      marginLeft: padding.xs,
      paddingVertical: padding.md,
      backgroundColor: colors.black,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 3,
      flex: 2
    },
    continueText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    },
    redeemButtonArea: {
      flexDirection: "row",
      width: "100%",
      marginTop: padding.sm
    },
    title: {
      fontSize: fonts.fontSize.lg + 8,
      fontWeight: fonts.fontWeight.bold,
      marginTop: padding.xxl,
      paddingVertical: padding.sm
    },
    subtitle: {
      color: colors.black,
      fontSize: fonts.fontSize.tl,
      paddingBottom: padding.lg,
      fontWeight: fonts.fontWeight.light
    },
    textInputError: {
      marginTop: padding.md + 2,
      paddingLeft: padding.xs,
      fontSize: fonts.fontSize.tl,
      marginBottom: -padding.lg
    }
  };
};

export const shoppingBagScreenStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;
  const continueButton = {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: padding.lg,
    paddingHorizontal: padding.xl * 3,
    borderColor: colors.black,
    borderRadius: padding.xs,
    borderWidth: 1
  };
  return {
    root: {
      ...miscellaneous.fill,
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: colors.lightGrey
    },
    leftSide: {
      flex: 1,
      marginRight: padding.sm
    },
    rightSide: {
      alignItems: "flex-end",
      marginLeft: padding.sm
    },
    continueButton: {
      ...continueButton,
      backgroundColor: colors.black
    },
    continueButtonDisabled: {
      ...continueButton,
      backgroundColor: colors.grey
    },
    continueText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    },
    helpPopUpArea: {
      ...miscellaneous.fill,
      justifyContent: "flex-start",
      alignItems: "center",
      padding: padding.xl
    },
    title: {
      fontSize: fonts.fontSize.lg + 8,
      fontWeight: fonts.fontWeight.bold
    },
    subtitle: {
      fontWeight: fonts.fontWeight.bold,
      fontColor: colors.black,
      fontSize: fonts.fontSize.xs
    }
  };
};

export const startScreenStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;

  return {
    root: {
      ...miscellaneous.fill,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.lightGrey
    },
    base: {
      ...miscellaneous.fill,
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.white
    },
    headingView: {
      width: "100%",
      alignItems: "center",
      marginTop: padding.md
    },
    titleText: {
      fontSize: fonts.fontSize.xl + 17,
      fontWeight: fonts.fontWeight.semiBold
    },
    subtitleText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.lg + 2,
      fontWeight: fonts.fontWeight.light
    },
    touchToStartArea: {
      alignItems: "center"
    },
    touchToStartInstructions: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.light
    },
    touchToStartButton: {
      alignItems: "center",
      marginTop: padding.sm,
      paddingVertical: padding.lg,
      paddingHorizontal: padding.xl * 3,
      borderColor: colors.black,
      borderRadius: 4,
      borderWidth: 1,
      backgroundColor: colors.black
    },
    touchToStartButtonText: {
      color: colors.white,
      fontSize: fonts.fontSize.xl,
      fontWeight: fonts.fontWeight.semiBold
    },
    stepsArea: {
      alignSelf: "stretch",
      paddingBottom: padding.lg
    },
    iconArea: {
      flexDirection: "row",
      justifyContent: "space-evenly"
    },
    icon: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: padding.sm
    },
    stepTextArea: {
      flexDirection: "row",
      justifyContent: "space-evenly"
    },
    step: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: padding.xl
    },
    scannerIcon: {
      borderColor: colors.black,
      color: colors.white,
      height: 73,
      width: 57
    },
    creditCardIcon: {
      borderColor: colors.black,
      color: colors.white,
      height: 56,
      width: 100
    },
    securityTagIcon: {
      borderColor: colors.black,
      color: colors.white,
      height: 53,
      width: 126
    },
    stepText: {
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.bold,
      textAlign:"center"
    },
    terminalClosedTextArea: {
      ...miscellaneous.fill,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.white
    }
  };
};

export const thankYouScreenStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;

  return {
    root: {
      ...miscellaneous.fill,
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: colors.white
    },
    securityTagIcon: {
      borderColor: colors.black,
      borderWidth: 2,
      color: colors.white,
      height: 236,
      width: 516
    },
    textArea: {
      alignItems: "center"
    },
    title: {
      fontSize: fonts.fontSize.xl + 8,
      fontWeight: fonts.fontWeight.bold
    },
    subtitle: {
      fontSize: fonts.fontSize.xl
    },
    generalText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.tl
    },
    thankYouIconSpace: {
      borderWidth: 1,
      borderColor: colors.darkGrey,
      height: 300,
      width: 350,
      marginBottom: padding.xs,
      marginTop: padding.xs
    }
  };
};
