import Theme from "../../styles";


export const paymentDeviceSelectionStyle = () => {
  const { forms, miscellaneous, padding } = Theme.styles;
  return ({
    ...miscellaneous,
    root: {
      ...miscellaneous.panel,
      flex: 1,
      height: forms.input.height + 4,
      marginTop: -padding.md,
      paddingHorizontal: padding.md
    },
    dialog: {
      minHeight: "25%"
    },
    input: {
      alignSelf: "stretch"
    },
    inputField: {
      alignSelf: "center",
      borderWidth: 1,
      borderColor: forms.input.borderColor,
      width: "100%",
      paddingTop: padding.sm
    }
  });
};

export const tabletOfflineAuthorizationStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white
    },
    formArea: {
      alignSelf: "center",
      width: 400
    },
    amountDueAmount: {
      fontSize: fonts.fontSize.bt + 1,
      fontWeight: fonts.fontWeight.bold
    },
    buttonsArea: {
      alignSelf: "center",
      flexDirection: "column",
      justifyContent: "space-evenly",
      marginTop: padding.md * 2,
      width: 400
    },
    button: {
      marginHorizontal: padding.xs,
      marginVertical: padding.xs - 2
    }
  };
};

export const nonIntegratedPaymentConfirmationStyles = () => {
  const { buttons, colors, fonts, padding, miscellaneous } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    headerTitle: {
      fontSize: fonts.fontSize.lg
    },
    topSection: {
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      width: "100%"
    },
    formArea: {
      alignSelf: "stretch"
    },
    amountDueTextArea: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: padding.md,
      marginBottom: padding.md
    },
    amountDueTitle: {
      fontSize : fonts.fontSize.sm
    },
    amountDueAmount: {
      fontSize : fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.bold
    },
    informationText: {
      color: colors.black,
      fontSize: fonts.fontSize.sm,
      textAlign: "center",
      width: "95%",
      paddingHorizontal: padding.sm
    }
  }, Theme.isTablet ? tabletNonIntegratedPaymentConfirmationStyles() : {});
};

export const tabletNonIntegratedPaymentConfirmationStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white
    },
    formArea: {
      alignSelf: "center",
      width: 400
    },
    amountDueAmount: {
      fontSize: fonts.fontSize.bt + 1,
      fontWeight: fonts.fontWeight.bold
    },
    buttonsArea: {
      alignSelf: "center",
      flexDirection: "column",
      justifyContent: "space-evenly",
      marginTop: padding.md,
      width: 400
    },
    button: {
      marginHorizontal: padding.xs,
      marginVertical: padding.xs - 2
    }
  };
};

export const offlineAuthorizationStyles = () => {
  const { buttons, colors, fonts, padding, miscellaneous } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    },
    headerTitle: {
      fontSize: fonts.fontSize.lg
    },
    topSection: {
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      width: "100%"
    },
    formArea: {
      alignSelf: "stretch"
    },
    amountDueTextArea: {
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: padding.md,
      marginBottom: padding.sm
    },
    amountDueTitle: {
      fontSize : fonts.fontSize.sm
    },
    amountDueAmount: {
      fontSize : fonts.fontSize.bt,
      fontWeight: fonts.fontWeight.bold
    },
    textInput: {
      alignSelf: "stretch",
      marginBottom: padding.xs
    },
    errorStyle: {
      marginHorizontal: padding.sm
    },
    informationText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm,
      textAlign: "left",
      width: "100%",
      paddingHorizontal: padding.sm,
      marginBottom: padding.md
    },
    buttonsArea: {
    },
    button: {
    }
  }, Theme.isTablet ? tabletOfflineAuthorizationStyles() : {});
};

export const offlineAuthorizationScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};

export const paymentOptionsStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    root: {
      height: "100%",
      alignSelf: "center",
      justifyContent: "flex-end",
      alignItems: "center",
      position: "absolute",
      bottom: 0,
      width: "100%",
      backgroundColor: colors.overlay
    },
    button: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm
    },
    mainText: {
      color: colors.darkGrey,
      marginBottom: padding.sm,
      textAlign: "left"
    },
    mainArea: {
      alignSelf: "stretch",
      backgroundColor: colors.lightGrey,
      padding: padding.sm
    },
    btnSeconday: {
      ...buttons.btnSeconday,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm
    },
    paymentButtonSubTitle: {
      ...buttons.btnSecondayText,
      color: colors.lightGrey,
      fontSize: fonts.fontSize.sm
    }
  }, Theme.isTablet ? {
    mainArea: {
      ...miscellaneous.screen
    }
  } : {});
};
