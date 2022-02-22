import Theme from "../../styles";


export const baseViewFill = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};

export const tabletIssueGiftCardStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white,
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "flex-start",
      paddingTop: padding.sm,
      paddingBottom: padding.sm,
      width: 350
    },
    actions: {
      margin: 0,
      marginTop: padding.md - 4,
      width: "100%"
    },
    button: {
      marginBottom: padding.sm - 2
    },
    controlArea: {
      width: "100%"
    }
  };
};

export const phoneIssueGiftCardStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    actions: {
      alignSelf: "stretch",
      padding: padding.sm,
      backgroundColor: colors.white
    },
    button: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm
    }
  };
};

export const issueGiftCardStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    textInput: {
      alignSelf: "stretch"
    },
    textInputError: {
      paddingLeft: padding.xs,
      paddingBottom: padding.xs
    },
    button: {
      justifyContent: "center"
    },
    activeTabStyle: {
      backgroundColor: colors.action
    },
    activeTabTextStyle: {
      color: colors.white
    },
    tabStyle: {
      borderColor: colors.action,
      marginTop: padding.sm,
      padding: padding.sm
    },
    controlArea: {
      paddingBottom: padding.sm,
      backgroundColor: colors.white
    },
    inputDisabled: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    },
    tabTextStyle: {
      color: colors.action
    },
    topSection: {
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      width: "100%"
    },
    totalArea: {
      justifyContent: "center",
      alignItems: "center",
      paddingTop: padding.md
    },
    totalText: {
      fontSize: fonts.fontSize.sm
    },
    totalAmountText: {
      fontSize: fonts.fontSize.tl,
      fontWeight: fonts.fontWeight.semibold
    }
  }, Theme.isTablet ? tabletIssueGiftCardStyle() : phoneIssueGiftCardStyle());
};

export const tabletCardRedeemStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    root: {
      alignItems: "center"
    },
    totalAmountText: {
      fontSize: fonts.fontSize.bt + 1,
      fontWeight: fonts.fontWeight.bold
    },
    bottomSection: {
      backgroundColor: colors.white,
      padding: padding.md,
      width: 400
    },
    buttonsArea: {
      flexDirection: "column",
      marginTop: padding.sm
    },
    redeemButton: {
      marginHorizontal: padding.xs,
      marginVertical: padding.xs - 2
    }
  };
};

export const cardRedeemStyles = () => {
  const { buttons, colors, forms, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...forms,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    topSection: {
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      width: "100%"
    },
    totalArea: {
      justifyContent: "center",
      alignItems: "center",
      paddingTop: padding.md
    },
    totalText: {
      fontSize: fonts.fontSize.sm
    },
    totalAmountText: {
      fontSize: fonts.fontSize.tl,
      fontWeight: fonts.fontWeight.semibold
    },
    paymentTitle: {
      alignSelf: "stretch",
      marginTop: padding.md - 4,
      marginHorizontal: padding.md,
      paddingBottom: padding.sm - 2
    },
    paymentLabel: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    textInput: {
      alignSelf: "stretch",
      marginHorizontal: padding.md
    },
    textInputError: {
      paddingLeft: padding.xs,
      paddingBottom: padding.xs
    },
    bottomSection: {
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      width: "100%"
    },
    buttonsArea: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginHorizontal: padding.sm,
      paddingBottom: padding.xs
    },
    redeemButton: {
      ...buttons.btnSeconday,
      alignItems: "center",
      justifyContent: "center",
      margin: padding.sm
    }
  }, Theme.isTablet ? tabletCardRedeemStyles() : {
    redeemButton: {
      flex: 1
    }
  });
};

export const tabletBalanceInquiryStyles = () => {
  const { miscellaneous, padding } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    },
    buttonContainer: {
      ...miscellaneous.screenActions,
      paddingVertical: padding.lg + 2
    }
  };
};

export const balanceInquiryStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding, textAlign } = Theme.styles;
  return Theme.merge(
    {
      ...buttons,
      root: {
        ...miscellaneous.fill,
        backgroundColor: colors.lightGrey
      },
      inputPanel: {
        width: "100%"
      },
      inputField: {
        paddingLeft: padding.md
      },
      buttonContainer: {
        ...miscellaneous.fill,
        padding: padding.md
      },
      mainButton: {
        ...buttons.btnPrimary,
        marginBottom: padding.sm
      },
      closeButton: {
        ...buttons.btnSeconday,
        marginBottom: padding.sm
      },
      resultsArea: {
        backgroundColor: colors.white,
        margin: padding.sm,
        paddingTop: padding.xs,
        paddingBottom: padding.xs
      },
      balanceResultsArea: {
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: padding.md,
        marginBottom: padding.md
      },
      textResultsArea: {
        flexDirection: "row",
        margin: padding.sm
      },
      descriptionTitle: {
        ...textAlign.tal,
        flex: 2,
        fontSize: fonts.fontSize.sm,
        color: colors.darkGrey
      },
      descriptionText : {
        ...textAlign.tar,
        flex: 1,
        fontSize: fonts.fontSize.sm,
        color: colors.darkGrey
      },
      balanceTextArea: {
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: padding.sm,
        marginBottom: padding.sm
      },
      balanceTitle: {
        fontSize : fonts.fontSize.sm,
        color: colors.darkGrey
      },
      balanceAmount: {
        fontSize : fonts.fontSize.bt,
        fontWeight: fonts.fontWeight.bold
      },
      receiptOptionsArea: {
        ...miscellaneous.fill,
        marginVertical: padding.sm,
        marginHorizontal: padding.sm
      },
      cautionPanel: {
        marginHorizontal: padding.xs
      }
    },
    Theme.isTablet
      ? tabletBalanceInquiryStyles()
      : {
        receiptFormStyles: {
          backgroundColor: colors.lightGrey
        }
      }
  );
};

export const balanceInquiryScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.fill
    }
  };
};

