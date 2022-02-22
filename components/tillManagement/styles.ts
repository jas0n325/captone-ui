import Color from "color";
import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../../ui/styles/index";

export const tabletTillManagementStyle = () => {
  const { colors, miscellaneous } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white,
      ...miscellaneous.screen
    }
  };
};

export const tillManagementStyles = () => {
  const { colors, fonts, miscellaneous, padding, buttons } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      backgroundColor: colors.lightGrey
    },
    button: {
      alignSelf: "stretch",
      backgroundColor: colors.white
    },
    buttonContents: {
      alignItems: "center",
      alignSelf: "stretch",
      borderColor: colors.lightGrey,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: padding.md,
      paddingVertical: padding.sm
    },
    buttonText: {
      color: fonts.color,
      fontSize: fonts.fontSize.md
    },
    scrollViewContainer: {
      flex: 1
    },
    chevronIcon: {
      color: colors.chevron,
      height: fonts.fontSize.tl,
      width: fonts.fontSize.tl
    }}, Theme.isTablet ? tabletTillManagementStyle() : {}
  );
};

export const tabletScanDrawerStyle = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen,
      backgroundColor: colors.white,
      paddingTop: padding.lg
    },
    inputPanel: {
      marginBottom: padding.md - 4
    },
    inputField: {
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderBottomWidth: 1,
      borderTopLeftRadius: padding.xs,
      borderBottomLeftRadius: padding.xs
    },
    cameraIconPanel: {
      borderRightWidth: 1,
      borderTopWidth: 1,
      borderTopRightRadius: padding.xs,
      borderBottomRightRadius: padding.xs
    },
    cameraIcon: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    },
    receiptOptionsArea: {
      justifyContent: "center",
      alignItems: "center"
    }
  };
};

export const scanDrawerStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      paddingBottom: getBottomSpace()
    },
    inputPanel: {
      alignSelf: "stretch"
    },
    inputField: {
      backgroundColor: colors.white,
      borderColor: colors.darkGrey,
      fontSize: fonts.fontSize.md,
      height: forms.input.height
    },
    inputError: {
      paddingLeft: padding.xs
    },
    cameraIconPanel: {
      backgroundColor: colors.white,
      borderColor: colors.darkGrey,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomWidth: 1,
      height: forms.input.height,
      width: 50
    },
    cameraIcon: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    },
    subtitleArea: {
      alignItems: "flex-start",
      justifyContent: "flex-end",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.grey,
      paddingLeft: padding.xs + padding.sm,
      marginBottom: padding.xs,
      paddingTop: padding.sm + padding.xs
    },
    subtitleText: {
      color: colors.darkestGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.xs + 1,
      marginTop: 0,
      marginBottom: padding.sm
    },
    emptyList: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "25%",
      paddingHorizontal: padding.md
    },
    emptyListText: {
      fontSize: fonts.fontSize.tl,
      textAlign: "center"
    },
    emptyListTextWithNewLine: {
      fontSize: fonts.fontSize.fm,
      textAlign: "center",
      marginBottom: padding.xs,
      paddingBottom: padding.md + 2
    },
    emptySubtitleText: {
      color: colors.darkGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.md
    },
    receiptOptionsArea: {
      ...miscellaneous.fill,
      paddingVertical: padding.lg
    }
  }, Theme.isTablet ? tabletScanDrawerStyle() : {});
};


export const tabletTillStyle = () => {
  const { colors, miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen,
      backgroundColor: colors.white
    },
    contentContainer: {
      ...miscellaneous.screen
    },
    header: {
      paddingTop: 0
    },
    tabArea: {
      width: "70%"
    }
  };
};

export const tillDetailStyles = () => {
  const { colors, fonts, miscellaneous, forms, padding, spacing, buttons } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    contentContainer: {
      alignSelf: "stretch",
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    header: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      marginBottom: padding.md - 4,
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.md - 6
    },
    alternateHeader: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      marginBottom: padding.xs - 4,
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.xs,
      paddingTop: padding.md - 6
    },
    textRow: {
      alignSelf: "stretch",
      alignItems: "flex-start",
      flexDirection: "row",
      justifyContent: Theme.isTablet ? "center" : "flex-start",
      marginBottom: padding.xs - 3,
      marginTop: padding.xs - 3
    },
    textTitle: {
      fontSize: fonts.fontSize.md - 1
    },
    textValue: {
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.bold,
      paddingLeft: padding.xs
    },
    expectedAmountText: {
      fontSize: fonts.fontSize.xxs,
      color: colors.darkerGrey,
      alignItems: "flex-start",
      backgroundColor: colors.white,
      flexDirection: "row",
      paddingLeft: padding.md - 2,
      paddingVertical: padding.xs - 1
    },
    tenderNameText: {
      fontSize: fonts.fontSize.nw,
      fontWeight: fonts.fontWeight.bold,
      color: colors.darkestGrey,
      paddingLeft: padding.md - 2,
      paddingVertical: padding.xs - 1
    },
    inputPanel: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: forms.input.borderColor,
      flexDirection: "row"
    },
    inputField: {
      backgroundColor: colors.white,
      flex: 1,
      fontSize: fonts.fontSize.md
    },
    inputErrorField: {
      borderBottomWidth: 1
    },
    textInput: {
      paddingLeft: padding.xs,
      flex: 1
    },
    inputError: {
      ...forms.inputErrorText,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey,
      fontSize: fonts.fontSize.xs,
      paddingLeft: spacing.md
    },
    amountError: {
      borderBottomColor: colors.bad
    },
    calculatorContainer: {
      position: "absolute",
      right: 0,
      top: 0,
      height: forms.input.height,
      flexDirection: "row",
      alignItems: "center"
    },
    calculator: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md
    },
    calculatorIcon: {
      color: colors.white,
      fontSize: fonts.fontSize.lg
    },
    amount: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      paddingTop: 0
    },
    amountSeparator: {
      paddingTop: spacing.md
    },
    hidden: {
      borderBottomWidth: 0,
      height: 0,
      width: 0
    },
    inputErrorMessage: {
      alignSelf: "stretch",
      borderColor: colors.bad,
      borderTopWidth: 1
    },
    inputErrorText: {
      ...forms.inputErrorText,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey,
      paddingLeft: padding.xs - 1
    },
    buttonRow: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderBottomColor: forms.input.borderColor,
      borderBottomWidth: 1,
      flexDirection: "row",
      height: forms.input.height,
      justifyContent: "space-between",
      paddingHorizontal: padding.md - 4
    },
    amountText: {
      color: colors.darkerGrey
    },
    cautionPanel: {
      alignSelf: "stretch",
      backgroundColor: Color(colors.caution).alpha(0.1).toString(),
      flexDirection: "row",
      borderLeftWidth: 4,
      borderLeftColor: colors.caution,
      paddingHorizontal: padding.md - 4,
      marginTop: padding.sm
    },
    cautionText: {
      color: colors.black,
      textAlign: "left",
      fontFamily: fonts.fontFamily,
      fontSize: fonts.fontSize.md - 2,
      padding: padding.sm
    },
    cautionIconPadding: {
      paddingVertical: padding.sm
    },
    cautionIcon: {
      color: colors.caution,
      fontSize: fonts.fontSize.md + 5
    },
    chevronIcon: {
      color: colors.darkGrey,
      height: padding.sm + 7,
      width: padding.sm - 2
    },
    spinnerContainer: {
      marginVertical: padding.lg
    },
    signatureBox: {
      marginBottom: padding.xs,
      marginTop: padding.sm,
      borderWidth: 1,
      borderColor: colors.black,
      borderStyle: "dashed",
      flex: 1,
      borderRadius: 0.5 // a fix to get dashed borders on Android. Is a RN bug.
    },
    signature: {
      flex: 1
    },
    additionalDetailsHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      justifyContent: "flex-end",
      marginBottom: padding.xs,
      padding: padding.md - padding.xs,
      paddingBottom: padding.xs
    },
    additionalDetailsHeaderText: {
      color: colors.darkestGrey,
      fontSize: fonts.fontSize.nw
    },
    additionalDetailsButton: {
      alignSelf: "stretch",
      backgroundColor: colors.white
    },
    additionalDetailsButtonContents: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "stretch",
      marginHorizontal: padding.md - padding.xs,
      paddingVertical: padding.sm,
      borderColor: colors.lightGrey,
      borderBottomWidth: 1
    },
    additionalDetailsButtonText: {
      color: fonts.colors,
      fontSize: fonts.fontSize.md
    },
    operationButtonIcon: {
      color: colors.grey,
      fontSize: fonts.fontSize.lg
    },
    additionalDetailsButtonSubText: {
      color: colors.darkestGrey,
      fontSize: fonts.fontSize.xxs
    },
    additionalDetailsButtonSubContents: {
      flexDirection: "row"
    },
    voidIconArea: {
      justifyContent: "flex-end",
      alignItems: "flex-start",
      padding: padding.sm
    },
    voidIcon: {
      color: colors.white,
      fontSize: fonts.fontSize.sm,
      padding: padding.xs - 3
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkGrey
    },
    additionalDetailsButtonIconArea: {
      alignItems: "center",
      flexDirection: "row"
    },
    footer: {
      backgroundColor: colors.transparent,
      justifyContent: "flex-end"
    },
    container: {
      ...miscellaneous.fill,
      padding: padding.md
    },
    btnSignaturePrimary: {
      ...buttons.btnPrimary,
      width: "20%"
    },
    btnSignatureSecondary: {
      ...buttons.btnSeconday,
      width: "15%",
      marginRight: 16
    },
    dividerInputText: {
      height: 1,
      backgroundColor: colors.grey,
      marginTop: padding.md - padding.xxs
    }
    }, Theme.isTablet ? tabletTillStyle() : {}
  );
};

export const currencyCalculatorStyles = () => {
  const { colors, fonts, miscellaneous, forms, padding, textAlign } = Theme.styles;
  return Theme.merge({
      ...miscellaneous,
      ...textAlign,
      root: {
        ...miscellaneous.fill,
        backgroundColor: colors.lightGrey,
        justifyContent: "flex-start"
      },
      header: {
        alignSelf: "stretch",
        alignItems: "center",
        backgroundColor: colors.white,
        paddingHorizontal: padding.md - 4,
        paddingVertical: padding.md - 4
      },
      textRow: {
        alignSelf: "stretch",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: padding.md - 4
      },
      textTitle: {
        fontSize: fonts.fontSize.md - 1
      },
      textValue: {
        fontSize: fonts.fontSize.md - 1,
        fontWeight: fonts.fontWeight.bold
      },
      tabArea: {
        alignItems: "stretch",
        flex: 1,
        paddingBottom: padding.lg - 4
      },
      activeTabStyle: {
        backgroundColor: colors.action
      },
      activeTabTextStyle: {
        color: colors.white
      },
      tabStyle: {
        backgroundColor: colors.white,
        borderColor: colors.action,
        height: forms.input.height * 0.6
      },
      tabTextStyle: {
        color: colors.action,
        fontSize: fonts.fontSize.xs + 1
      },
      scrollViewContent: {
        flexGrow: 1
      },
      headerRow: {
        alignSelf: "stretch",
        backgroundColor: colors.accent,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: padding.md - 4,
        paddingVertical: padding.sm
      },
      headerTitle: {
        flex: 1,
        fontSize: fonts.fontSize.md - 1
      },
      inputPanel: {
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: colors.white,
        flexDirection: "row"
      },
      inputField: {
        backgroundColor: colors.white,
        flex: 1,
        fontSize: fonts.fontSize.md,
        height: forms.input.height
      },
      inputError: {
        paddingLeft: padding.xs
      },
      amountError: {
        borderBottomColor: colors.bad
      }
    }, Theme.isTablet ? tabletTillStyle() : {}
  );
};

export const tillVarianceReasonStyles = () => {
  const { colors, fonts, forms, miscellaneous, padding, textAlign } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...textAlign,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    header: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      marginBottom: Theme.isTablet ? 0 : padding.md - 4,
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.md - 4
    },
    textTitle: {
      fontSize: fonts.fontSize.md - 1
    },
    reason: {
      alignSelf: "stretch",
      backgroundColor: colors.white
    },
    reasonCodeInput: {
      alignSelf: "stretch",
      justifyContent: "space-between",
      backgroundColor: colors.white,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      minHeight: forms.input.height
    },
    errorText: {
      marginHorizontal: padding.md
    },
    chevronIcon: {
      color: colors.darkGrey,
      height: padding.sm + 7,
      width: padding.sm - 2
    },
    hidden: {
      height: 0
    },
    inputErrorText: {
      ...forms.inputErrorText,
      paddingLeft: padding.xs - 1
    },
    commentHeader: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      height: forms.input.height * 3,
      paddingBottom: padding.lg,
      paddingTop: padding.xs,
      paddingVertical: padding.md - 4
    },
    field: {
      alignSelf: "stretch"
    }
  }, Theme.isTablet ? tabletTillStyle() : {
    inputField: {
      borderBottomWidth: 0
    }
  });
};

export const tillSuccessStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.statusBarHeight,
      alignSelf: "stretch",
      backgroundColor: colors.lightGrey,
      flex: 1,
      justifyContent: "flex-start"
    },
    header: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      marginBottom: Theme.isTablet ? 0 : padding.md - 4,
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.md - 4
    },
    successIcon: {
      fontSize: fonts.fontSize.lg
    },
    titleText: {
      color: colors.black,
      fontSize: fonts.fontSize.tl,
      marginBottom: padding.xs,
      marginTop: padding.md - 4,
      textAlign: "center"
    },
    subtitleText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm,
      marginBottom: padding.xs
    },
    buttonMargin: {
      marginHorizontal: Theme.isTablet ? (padding.xl * 2) : 0
    },
    anotherButton: {
      marginTop: padding.sm - 2
    },
    backButton: {
      height: padding.xl - 2
    }
  }, Theme.isTablet ? tabletTillStyle() : {});
};

export const transactionStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    transaction: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      backgroundColor: colors.white,
      borderColor: Theme.isTablet ? colors.grey : colors.white,
      borderWidth: 1,
      borderRadius: padding.sm,
      marginHorizontal: Theme.isTablet ? 0 : padding.sm,
      marginVertical: padding.xs,
      padding: padding.sm
    },
    details: {
      flex: 1
    },
    transactionRow: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: padding.xs
    },
    transactionText: {
      color: colors.black,
      fontSize: fonts.fontSize.md
    },
    attributeText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs
    },
    arrowArea: {
      alignItems: "stretch",
      justifyContent: "flex-end",
      paddingLeft: padding.xs
    },
    svgIcon: {
      color: colors.chevron,
      height: fonts.fontSize.tl,
      width: fonts.fontSize.tl
    },
    referenceNumberField: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs,
      fontWeight: fonts.fontWeight.semibold
    }
  };
};

export const tillAdditionalDetailStyles = () => {
  const { colors, forms, miscellaneous, padding, textAlign, buttons } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...textAlign,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    descriptionHeader: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      height: forms.input.height * 2,
      paddingBottom: padding.lg,
      paddingTop: padding.xs,
      paddingVertical: padding.md
    },
    field: {
      alignSelf: "stretch"
    },
    receiptOptionsArea: {
      alignSelf: "stretch",
      paddingHorizontal: padding.md,
      backgroundColor: colors.white,
      marginTop: padding.sm
    },
    receiptButton: {
      margin: padding.sm
    },
    imagesOptionsArea: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.white,
      marginTop: padding.sm
    },
    imagePreview: {
      alignSelf: "stretch",
      flex: 1
    },
    imagePreviewArea:{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.black
    }
  }, Theme.isTablet ? tabletTillStyle() : {
    inputField: {
      borderBottomWidth: 0
    }
  });
};

export const tillVarianceStyles = () => {
  const { buttons, colors, miscellaneous, spacing } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    btnSecondary: {
      ...buttons.btnSeconday,
      marginBottom: spacing.xs
    },
    btnSecondaryText: {
      ...buttons.btnSecondayText
    },
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    varianceWrapper: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xs,
      backgroundColor: colors.white
    },
    varianceAmounts: {
      marginTop: spacing.md
    },
    varianceHeader: {
      fontWeight: "bold"
    },
    varianceRow: {
      flexDirection: "row",
      marginTop: spacing.xxs
    },
    tenderName: {
      width: "50%",
      paddingRight: spacing.md
    },
    tenderVariance: {
      width: "50%"
    },
    actions: {
      marginTop: spacing.md
    }
  }, Theme.isTablet ? tabletTillStyle() : {});
};
