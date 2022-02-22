import Color from "color";
import { Dimensions, Platform } from "react-native";
import { getBottomSpace, isIphoneX } from "react-native-iphone-x-helper";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";

const tabletItemLineMaxWidth = "90%";

export const adderSubtractorStyles = () => {
  const { colors, fonts, padding } = Theme.styles;

  return {
    root: {
      flexDirection: "row",
      backgroundColor: colors.white
    },
    buttonArea: {
      justifyContent: "center",
      alignItems: "center",
      borderColor: colors.action,
      borderWidth: 1,
      paddingHorizontal: padding.md - 4
    },
    subtractorArea: {
      borderTopLeftRadius: padding.xs - 1,
      borderBottomLeftRadius: padding.xs - 1
    },
    adderArea: {
      borderTopRightRadius: padding.xs - 1,
      borderBottomRightRadius: padding.xs - 1
    },
    iconText: {
      textAlignVertical: "center",
      fontSize: fonts.fontSize.tl + 2,
      fontWeight: fonts.fontWeight.bold,
      color: colors.action
    },
    disabledButtonArea: {
      borderColor: colors.darkGrey
    },
    disabledIconText: {
      color: colors.darkGrey
    }
  };
};

export const alertModalStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;

  const androidAlertWidth: number = 555;

  const platformIsIos: boolean = Platform.OS === "ios";

  return Theme.merge(
    {
      root: {
        ...miscellaneous.fill,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.shadow
      },
      nonButtonArea: {
        alignSelf: "stretch",
        padding: padding.md
      },
      alertTitle: {
        fontWeight: fonts.fontWeight.bold,
        color: fonts.color
      },
      alertDescription: {
        fontWeight: fonts.fontWeight.regular,
        color: fonts.color
      }
    },
    platformIsIos
        ? {
          alertArea: {
            width: Theme.isTablet ? 270 : 230,
            backgroundColor: "rgb(238, 238, 240)",
            borderRadius: padding.sm
          },
          nonButtonArea: {
            alignItems: "center",
            padding: padding.md,
            paddingBottom: 0
          },
          alertTitle: {
            fontSize: fonts.fontSize.fm,
            textAlign: "center"
          },
          alertDescription: {
            fontSize: fonts.fontSize.nw,
            textAlign: "center",
            marginTop: padding.xs
          },
          iosButtonsArea: {
            alignSelf: "stretch",
            justifyContent: "center",
            alignItems: "center",
            marginTop: padding.md
          },
          iosTwoButtonArea: {
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "flex-start"
          },
          iosButton: {
            alignSelf: "stretch",
            justifyContent: "center",
            alignItems: "center",
            padding: padding.sm,
            borderTopWidth: 1,
            borderTopColor: colors.grey
          },
          iosTwoButtonDivider: {
            flex: 1,
            alignSelf: undefined as string,
            borderRightColor: colors.grey,
            borderRightWidth: 1
          },
          iosButtonDefaultText: {
            color: "rgb(62, 136, 245)",
            fontSize: fonts.fontSize.fm,
            fontWeight: fonts.fontWeight.medium
          },
          iosCancelButtonText: {
            color: "rgb(49, 123, 246)",
            fontWeight: fonts.fontWeight.bold
          },
          iosDestructiveButtonText: {
            color: colors.bad
          },
          iosButtonActive: {
            color: colors.shadow
          }
        }
        : {
          alertArea: {
            width: Theme.isTablet ? androidAlertWidth : "80%",
            minHeight: 175,
            justifyContent: "space-between",
            backgroundColor: colors.white,
            borderRadius: 2
          },
          nonButtonArea: {
            alignItems: "flex-start"
          },
          alertTitle: {
            fontSize: fonts.fontSize.tl,
            textAlign: "left"
          },
          alertDescription: {
            fontSize: fonts.fontSize.md,
            textAlign: "left",
            marginTop: padding.sm
          },
          androidButtonArea: {
            alignSelf: "stretch",
            flexDirection: "row-reverse",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            flexWrap: "wrap",
            paddingHorizontal: padding.md,
            paddingBottom: padding.md
          },
          threeButtons: {
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-end"
          },
          firstAndroidButton: {
            marginLeft: padding.md
          },
          androidButtonText: {
            alignSelf: "stretch",
            justifyContent: "flex-end",
            fontSize: fonts.fontSize.fm,
            fontWeight: fonts.fontWeight.semibold,
            color: colors.good,
            textAlign: "right",
            paddingTop: padding.md
          }
        }
  );
};

const getStatusBarHeight = () => {
  const { padding } = Theme.styles;
  const { height, width } = Dimensions.get('window');
  const aspectRatio = height / width;
  const isIpadPro = aspectRatio < 0.75;

  let statusBarHeight = padding.md;

  if (isIphoneX()) {
    statusBarHeight = padding.lg;
  } else if (isIpadPro) {
    statusBarHeight = padding.md - 5;
  }

  return statusBarHeight;
}

const actionHorizontalPadding = Theme.isTablet ? 0 : Theme.styles.padding.sm - 2;

export const headerStyles = () => {
  const { colors, fonts, forms, miscellaneous, padding, spacing } = Theme.styles;
  const statusBarHeight = getStatusBarHeight();

  const getStatusBarStyles = (borderTopColor: string) => ({
    ...Platform.select({
      ios: {
        borderTopWidth: statusBarHeight,
        marginTop: Theme.isTablet ? -(statusBarHeight) - 2 : 0,
        borderTopColor
      },
      android: {
        borderTopWidth: 0
      },
      windows: {
        borderTopWidth: 0
      }
    })
  })

  return Theme.merge({
    ...colors,
    ...miscellaneous,
    root: {
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      paddingHorizontal: Theme.isTablet ? padding.sm + 2 : 0,
      ...getStatusBarStyles(colors.loginAndHeaderBackground)
    },
    statusBar: {
      ...Platform.select({
        ios: {
          height: statusBarHeight
        },
        android: {
          height: 0
        },
        windows: {
          height: 0
        }
      }),
      backgroundColor: "rgba(0,0,0,0.32)",
      flexDirection: "row",
      alignSelf: "stretch",
      zIndex: 100
    },
    base: {
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      ...Platform.select({
        ios: {
          paddingTop: statusBarHeight
        },
        android: {
          paddingTop: padding.xs
        },
        windows: {
          paddingTop: padding.sm - 2
        }
      })
    },
    returnMode: {
      backgroundColor: colors.returnHeaderBackground,
      ...getStatusBarStyles(colors.returnHeaderBackground)
    },
    headerLogo: {
      alignSelf: "flex-end",
      flex: 4,
      height: forms.input.height - padding.sm,
      width: 200
    },
    actions: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      height: Theme.isTablet ? spacing.xl - 2 : forms.input.height,
      paddingHorizontal: actionHorizontalPadding,
      marginTop: spacing.sm
    },
    actionBtn: {
      alignItems: "center",
      flexDirection: "row",
      height: Theme.isTablet ? spacing.xl : forms.input.height,
      justifyContent: "flex-start",
      marginRight: Theme.isTablet ? padding.xs - 1 : 0,
      paddingHorizontal: actionHorizontalPadding,
      marginTop: -spacing.xs
    },
    actionIcon: {
      height: Theme.isTablet ? padding.xl - 2 : forms.input.height,
      marginRight: Theme.isTablet ? padding.xs - 1 : 0,
      paddingHorizontal: actionHorizontalPadding
    },
    actionIconNoText: {
      height: Theme.isTablet ? padding.xl : forms.input.height,
      left: -padding.md + 4,
      top: -spacing.xxs - 1,
      paddingHorizontal: spacing.md + 3,
      minWidth: padding.xl
    },
    vectorButton: {
      alignItems: "center",
      flexDirection: "row",
      height: Theme.isTablet ? spacing.xl : forms.input.height,
      justifyContent: "flex-start",
      marginRight: Theme.isTablet ? padding.xs - 1 : 0,
      paddingHorizontal: actionHorizontalPadding,
      marginTop: -spacing.xs
    },
    vectorButtonIcon: {
      fontSize: fonts.fontSize.bt,
      color: colors.navigationText
    },
    actionTitle: {
      color: colors.navigationText,
      fontSize: Theme.isTablet ? fonts.fontSize.fm : fonts.fontSize.fm + 1
    },
    panel: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      justifyContent: "center",
      paddingBottom: spacing.sm,
      paddingHorizontal: spacing.md
    },
    row: {
      alignSelf: "stretch",
      justifyContent: "center",
      alignItems: "center"
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      paddingBottom: spacing.xs
    },
    rightButtonsArea: {
      flexDirection: "row"
    },
    leftArea: {
      alignItems: "flex-start",
      paddingLeft: spacing.md - 1,
      flex: 1
    },
    centerArea: {
      alignItems: "center",
      flex: 2
    },
    rightArea: {
      alignItems: "flex-end",
      flex: 1
    },
    topRowTitle: {
      alignSelf: "center",
      fontSize: Platform.OS === "ios" ? fonts.fontSize.fm : fonts.fontSize.md,
      textAlign: "center"
    },
    title: {
      color: colors.loginAndHeaderText,
      fontSize: Platform.OS === "ios" ? fonts.fontSize.tl + 1 : fonts.fontSize.tl,
      fontWeight: Platform.OS === "ios" ? fonts.fontWeight.semibold : fonts.fontWeight.medium
    },
    tabletRoot: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: Platform.OS === "ios" ? spacing.md : padding.sm,
      paddingBottom: spacing.xs - 2,
      height: Platform.OS === "ios" ? 72 : 54
    },
    tabletTitle: {
      color: colors.loginAndHeaderText,
      fontSize: Platform.OS === "ios" ? fonts.fontSize.tl + 1 : fonts.fontSize.tl,
      fontWeight: Platform.OS === "ios" ? fonts.fontWeight.semibold : fonts.fontWeight.medium,
      textAlign: "center",
      marginTop: -spacing.xs
    },
    tabletPanel: {
      paddingHorizontal: spacing.md
    },
    elementWrapper: {
      alignItems: "center",
      flex: 1,
      justifyContent: "flex-start"
    },
    leftElement: {
      alignItems: "flex-start"
    },
    rightElement: {
      alignItems: "flex-end"
    },
    leftIcon: {
      alignItems: "flex-start",
      paddingLeft: spacing.md - 1
    },
    input: {
      flex: 1,
      paddingTop: spacing.sm - 2
    }
  }, Theme.isTablet ? {
    actions: {
      marginTop: 0
    }
  } : {});
};

export const offlineNoticeStyle = () => {
  return Theme.merge({
    offlineContainer: {
      backgroundColor: "rgba(240,179,35,1)",
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      position: "relative"
    },
    offlineText: {
      color: "rgba(255,255,255,1)",
      fontSize: 15
    }
  }, Theme.isTablet ? {
    offlineContainer: {
      backgroundColor: "rgba(240,179,35,1)",
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row'
    },
    offlineText: {
      color: "rgba(255,255,255,1)",
      fontSize: 15
    }
  } : {});
};

export const iconStyles = () => {
  const { padding } = Theme.styles;
  return {
    button: {
      marginHorizontal: padding.sm - 3
    },
    raised: {
      ...Platform.select({
        ios: {
          shadowColor: "rgba(0, 0, 0, 0.4)",
          shadowOffset: {height: 1, width: 1},
          shadowOpacity: 1,
          shadowRadius: 1
        }/*,
      android: {
        elevation: 2
      }*/
      })
    }
  };
};

export const actionPanelStyle = () => {
  const { buttons, colors, miscellaneous, spacing } = Theme.styles;
  return Theme.merge(
    {
      ...buttons,
      root: {
        ...miscellaneous.fill
      },
      actionPanel: {
        alignSelf: "stretch",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
      },
      lastBtn: {
        height: buttons.btnAction.height,
        width: buttons.btnAction.width
      }
    },
    Theme.isTablet
      ? {}
      : {
        fill: {
          backgroundColor: colors.white
        },
        actionPanel: {
          padding: spacing.sm
        }
      }
  );
};

export const inTransactionActionPanelStyle = () => {
  return actionPanelStyle();
};

export const notInTransactionActionPanelStyle = () => {
  return actionPanelStyle();
};

export const itemSelectionActionPanelStyle = () => {
  return actionPanelStyle();
};

export const productActionPanelStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return ({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      padding: Theme.isTablet ? 0 : padding.sm - 2,
      paddingTop: Theme.isTablet ? 0 : padding.sm + 2
    },
    infoButton: {
      ...buttons.btnSeconday,
      backgroundColor: Theme.isTablet ? buttons.btnAction.backgroundColor : colors.white,
      borderColor: Theme.isTablet ? buttons.btnAction.borderColor : colors.white,
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: padding.sm - 2
    },
    infoButtonIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.tl
    },
    infoButtonText: {
      ...buttons.btnSecondayText,
      paddingLeft: padding.xs - 1
    },
    actionsPanel: {
      ...miscellaneous.fill,
      alignItems: "center",
      justifyContent: "flex-start"
    },
    actions: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between"
    },
    btnAction: {
      ...buttons.btnAction,
      borderRadius: 4,
      borderWidth: 1,
      height: Theme.isTablet ? buttons.btnAction.height : 96,
      width: Theme.isTablet ? buttons.btnAction.width : 96,
      marginTop: padding.sm
    },
    btnActionText: {
      fontSize: Theme.isTablet ? buttons.btnActionText.fontSize : fonts.fontSize.sm - 1
    },
    lastBtn: {
      height: Theme.isTablet ? buttons.btnAction.height : 96,
      width: Theme.isTablet ? buttons.btnAction.width : 96
    }
  });
};

export const actionButtonStyle = () => {
  const { buttons, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    actionButton: {
      alignItems: "center",
      justifyContent: "center",
      margin: padding.sm - 2
    }
  }, Theme.isTablet ? {
    btnDisabled: {
      borderWidth: 0
    }
  } : {});
};

export const editButtonStyle = () => {
  const { buttons, colors } = Theme.styles;
  return Theme.merge({
    ...buttons,
    editButtonArea: {
      alignItems: "flex-end",
      paddingEnd: 15,
      paddingTop: 10,
      color: colors.transparent
    }
  }, Theme.isTablet ? {
    btnDisabled: {
      backgroundColor: colors.white,
      borderWidth: 0
    }
  } : {});
};

export const inputStyle = () => {
  const { colors, forms, miscellaneous, padding } = Theme.styles;
  return ({
    ...miscellaneous,
    barcodeColor: colors.accent,
    root: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      padding: padding.xs
    },
    inputText: {
      ...forms.input,
      ...forms.inputText
    }
  });
};

export const textInputStyle = () => {
  const { colors, fonts, forms, padding } = Theme.styles;
  return ({
    placeholderTextColor: colors.placeholderTextColor,
    selectionColor: colors.selectionColor,
    underlineColorAndroid: colors.underlineColorAndroid,
    disabledColor: colors.darkGrey,
    inputTextPanel: {
      alignSelf: "stretch",
      flexDirection: "row",
      ...forms.input,
      borderBottomWidth: 0
    },
    inputText: {
      flex: 1,
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 0,
      borderBottomWidth: 1,
      borderColor: colors.grey,
      ...forms.inputText,
      padding: 0,
      margin: 0
    },
    inputTextError: {
      ...forms.inputError
    },
    clearPadding: {
      paddingRight: 0
    },
    placeholderLabelText: {
      color: colors.placeholderTextColor,
      fontSize: fonts.fontSize.xxs,
      paddingLeft: padding.md - 4,
      paddingBottom: 0,
      textAlign: "left",
      marginBottom: 0
    },
    disabledLabelText: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    },
    clearTopPadding: {
      paddingTop: 0
    },
    container: {
      flex: 1,
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 0,
      flexDirection: "column",
      paddingLeft: padding.xs - 4,
      paddingTop: padding.sm,
      justifyContent: "flex-start",
      width: "100%",
      color: colors.black,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.md,
      textAlign: "left"
    },
    inputPanel: {
      backgroundColor: forms.input.backgroundColor,
      borderBottomWidth: 0,
      height: forms.input.height,
      padding: 0
    },
    cameraIconPanel: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomColor: forms.input.borderColor,
      borderBottomWidth: 1,
      height: forms.input.height,
      justifyContent: "center",
      marginRight: 0,
      width: 50
    },
    cameraIcon: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    },
    counterText: {
      fontSize: fonts.fontSize.md,
      color: colors.grey,
      textAlign: "right",
      marginRight: padding.sm
    },
    disabled: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.action
    }
  });
};

export const selectReasonStyle = () => {
  const { buttons, colors, forms, fonts, padding } = Theme.styles;
  return {
    ...buttons,
    root: {
      alignSelf: "stretch",
      backgroundColor: colors.white
    },
    btnReasonCode: {
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: forms.input.borderColor,
      flexDirection: "row",
      justifyContent: "space-between",
      height: forms.input.height,
      paddingHorizontal: padding.md,
      width: "100%"
    },
    btnReasonCodeText: {
      color: fonts.color,
      fontSize: fonts.fontSize.fm
    },
    errorStyle: {
      ...forms.inputErrorText,
      backgroundColor: colors.white,
      paddingBottom: padding.sm
    }
  };
};

export const switchStyle = () => {
  const { colors, forms, padding } = Theme.styles;
  return Theme.merge({
    switchPanel: {
      paddingLeft: padding.sm - 1,
      justifyContent: "center",
      ...forms.input
    },
    switchContainer: {
      width: Theme.isTablet ?  "89%" : "85%",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center"
    },
    switchText: {
      width: "100%"
    },
    switch: {
      justifyContent: "flex-end"
    },
    inputTextError: {
      ...forms.inputError
    },
    thumbColor: {
      color: Platform.OS === "ios" ? undefined : colors.action
    },
    disabled: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    }
  });
};

export const selectOptionsStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...forms,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.action
    },
    arrowArea: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "stretch",
      flexGrow: 1
    },
    btnArea: {
      justifyContent: "flex-end",
      padding: padding.sm,
      marginBottom: padding.sm
    },
    controlsRow: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      flexDirection: "row",
      height: forms.input.height,
      justifyContent: "flex-start",
      paddingHorizontal: padding.md - 4,
      width: "100%"
    },
    inputText: {
      flex: 1,
      ...forms.input,
      ...forms.inputText,
      borderBottomWidth: 0,
      paddingLeft: 0
    },
    inputTextError: {
      ...forms.inputError
    },
    placeholderLabelText: {
      color: colors.placeholderTextColor,
      fontSize: fonts.fontSize.xxs,
      textAlign: "left"
    },
    disabled: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    },
    container: {
      flex: 1,
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 0,
      flexDirection: "column",
      paddingLeft: padding.xs - 4,
      paddingTop: padding.sm,
      justifyContent: "flex-start",
      width: "100%",
      color: colors.black,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.md,
      textAlign: "left",
      flexGrow: 10
    }
  });
};

export const fieldValidationStyle = () => {
  const { forms } = Theme.styles;
  return ({
    viewStyle: {
      alignSelf: "center"
    },
    errorStyle: forms.inputErrorText
  });
};

export const cameraScannerButtonStyle = () => {
  const { colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  return ({
    cameraIconArea: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderTopRightRadius: padding.xs,
      borderBottomRightRadius: padding.xs,
      height: forms.input.height,
      justifyContent: "center",
      marginRight: 0,
      width: 50
    },
    cameraIconButton: {
      ...miscellaneous.fill,
      alignItems: "center",
      justifyContent: "center"
    },
    cameraIcon: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    },
    defaultIconStyle: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xl
    },
    iconStyle: {
      cautionColor: colors.bad,
      successColor: colors.good,
      height: fonts.fontSize.xxl * 1.5
    }
  });
};

export const displayStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding, spacing, textAlign } = Theme.styles;
  return ({
    ...buttons,
    ...colors,
    ...miscellaneous,
    ...textAlign,
    basket: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.lightGrey,
      flex: 1,
      justifyContent: Theme.isTablet ? "center" : "flex-start"
    },
    itemList: {
      width: "100%"
    },
    statusTags: {
      backgroundColor: Theme.isTablet ? colors.lighterGrey : colors.white,
      paddingTop: padding.sm,
      paddingBottom: padding.sm,
      paddingLeft: padding.xs,
      paddingRight: padding.sm,
      borderBottomWidth: Theme.isTablet ? padding.xs - padding.xxs : 0,
      borderBottomColor: colors.grey
    },
    salesPersonArea: {
      marginBottom: padding.xs - 1
    },
    salesPersonTextArea: {
      backgroundColor: colors.lightGrey,
      flexDirection: "row",
      padding: padding.md - 4,
      paddingBottom: padding.xs - 1
    },
    salesPerson: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    salesPersonName: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    returnItemsSeparator: {
      alignSelf: "stretch",
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      marginTop: spacing.md
    },
    saleItemsSeparator: {
      alignSelf: "stretch",
      backgroundColor: colors.separator,
      height: spacing.xxs,
      marginTop: spacing.md
    },
    emptyBasket: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: Theme.isTablet ? 0 : 50
    },
    emptyBasketIcon: {
      alignItems: "center",
      backgroundColor: colors.darkGrey,
      borderRadius: 50,
      fontSize: fonts.fontSize.xxl,
      justifyContent: "center",
      height: 100,
      margin: padding.md - 2,
      width: 100
    },
    emptyBasketReturnIcon: {
      alignItems: "center",
      backgroundColor: colors.bad,
      borderRadius: 49, //line across the icon is shown if borderRadius is 50
      fontSize: fonts.fontSize.tl * 2.5,
      justifyContent: "center",
      height: 100,
      margin: padding.md - 2,
      width: 100
    },
    emptyBasketText: {
      height: 48,
      justifyContent: "space-between"
    },
    emptyBasketTitle: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.fm,
      textAlign: "center"
    },
    emptyBasketReturnTitle: {
      color: colors.black
    },
    emptyBasketScan: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.fm,
      textAlign: "center"
    },
    itemRow: {
      flex: 1,
      alignItems: "center"
    },
    voidRow: {
      alignItems: "center",
      flexDirection: "row",
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    strikeOut: {
      alignSelf: "center",
      backgroundColor: colors.bad,
      flex: 2,
      height: 1,
      marginHorizontal: padding.sm
    },
    voided: {
      color: colors.bad,
      fontSize: fonts.fontSize.bt,
      transform: [{rotate: "345deg"}]
    },
    openTerminalButton: {
      marginTop: padding.md
    },
    footerContainer: {
      width: "100%",
      alignItems: "center"
    },
    footerArea: {
      marginHorizontal: spacing.xs,
      marginTop: spacing.sm,
      maxWidth: Theme.isTablet ? tabletItemLineMaxWidth : 521
    },
    feedBackNote: {
      marginHorizontal: padding.sm-2,
      paddingTop: padding.md-4,
      paddingBottom: padding.xs
    }
  });
};

export const tabletItemLineStyles = () => {
  const { fonts} = Theme.styles;
  return ({
    root: {
      maxWidth: tabletItemLineMaxWidth
    },
    itemDescriptionText: {
      fontSize: fonts.fontSize.fm
    },
    itemPriceText: {
      fontSize: fonts.fontSize.fm + 1
    }
  });
};

export const itemLineStyles = () => {
  const { colors, fonts, miscellaneous, padding, spacing, textAlign } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    root: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderRadius: padding.sm - 2,
      justifyContent: "center",
      marginVertical: padding.xs - 1,
      marginLeft: spacing.xs,
      marginRight: spacing.xs,
      marginTop: spacing.xs,
      padding: padding.sm - 2
    },
    row: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    imageCell: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      paddingRight: padding.sm
    },
    image: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center"
    },
    imageSize: {
      height: Theme.isTablet ? 68 : 90,
      width: 60
    },
    descriptionCell: {
      alignItems: "center",
      alignSelf: "stretch",
      flex: 7,
      justifyContent: "center"
    },
    giftOrTotalLine: {
      alignItems: "flex-start",
      borderTopColor: colors.grey,
      borderTopWidth: 1,
      flexDirection: "row",
      marginTop: padding.xs - 1,
      paddingTop: padding.xs - 1,
      alignSelf: "flex-start",
      justifyContent: "space-between"
    },
    itemTags: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-start",
      overflow: "hidden",
      alignItems: "flex-start",
      alignSelf: "flex-start",
      flexWrap: "wrap"
    },
    tagCell: {
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      alignSelf: "flex-start",
      paddingRight: spacing.xxs,
      paddingTop: spacing.xxs - 1
    },
    totalAmountCell: {
      alignItems: "flex-end",
      alignSelf: "flex-start",
      justifyContent: "center",
      flexWrap: "nowrap",
      display: "flex"
    },
    descriptionCellLine: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    itemAttribute: {
      paddingRight: padding.md
    },
    pricePadding: {
      paddingRight: padding.sm
    },
    itemDescriptionText: {
      color: colors.black,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.regular
    },
    itemDetailsText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: padding.xs - 2
    },
    itemOriginalPriceText: {
      ...textAlign.tar,
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: padding.xs - 2,
      marginTop: -padding.sm
    },
    itemReturnPriceText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs - 1,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: padding.xxs
    },
    itemTaxExemptText: {
      color: colors.itemDiscountsText,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: padding.xs - 2
    },
    itemQuantityText: {
      ...textAlign.tar,
      color: colors.black,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.semibold,
      paddingTop: padding.xs - 1
    },
    itemQuantityTextNonMerch: {
      ...textAlign.tar,
      color: colors.black,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.semibold,
      paddingTop: padding.xs - 1,
      marginTop: -padding.sm,
      paddingBottom: padding.sm
    },
    textCell: {
      maxWidth: "75%"
    },
    amountCell: {
      alignItems: "center",
      alignSelf: "flex-end",
      justifyContent: "center"
    },
    discountCellLine: {
      alignItems: "center",
      alignSelf: "stretch",
      borderTopColor: colors.grey,
      borderTopWidth: 1,
      justifyContent: "center",
      marginTop: padding.xs - 1
    },
    discountLine: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    itemAmountText: {
      ...textAlign.tar,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.semibold,
      paddingTop: padding.xs - 1
    },
    itemPriceText: {
      ...textAlign.tar,
      color: colors.black,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.semibold,
      paddingTop: padding.xs - 1,
      display: "flex"
    },
    discountText: {
      color: colors.itemDiscountsText
    },
    activeUnitPriceText: {
      color: colors.itemDiscountsText
    },
    giftIcon: {
      color: colors.black,
      fontSize: fonts.fontSize.sm
    },
    giftText: {
      color: colors.black,
      paddingLeft: padding.xs
    },
    taxOverrideLine: {
      flexDirection: "row",
      justifyContent: "center",
      alignContent: "center"
    },
    taxOverrideColumnAlign: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignContent: "center"
    },
    taxOverrideColumnSize: (flex: number = 1) => ({
      flex
    })
  },
  Theme.isTablet ? tabletItemLineStyles() : {root: {maxWidth: 521}});
};

export const selectableItemLineStyles = () => {
  const { colors, fonts, padding, spacing, textAlign } = Theme.styles;

  const borderRadiusSentinel: number = padding.sm - 2;

  return Theme.merge({
    itemLine: {
      flexDirection: "row",
      marginHorizontal: borderRadiusSentinel,
      marginTop: padding.sm,
      borderRadius: borderRadiusSentinel
    },
    selectCell: {
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: spacing.md
    },
    selectCellIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.bt
    },
    itemAndQuantityArea: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "stretch",
      borderRadius: borderRadiusSentinel,
      backgroundColor: colors.itemQuantity
    },
    item: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 0,
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 0,
      marginVertical: 0,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRadius: borderRadiusSentinel,
      backgroundColor: colors.white
    },
    itemDisabled: {
      opacity: 0.4
    },
    itemIsSelected: {
      borderTopRightRadius: borderRadiusSentinel,
      borderBottomRightRadius: borderRadiusSentinel
    },
    arrowArea: {
      alignItems: "stretch",
      justifyContent: "center",
      paddingRight: spacing.sm,
      width: padding.md,
      height: "100%",
      backgroundColor: colors.white,
      borderTopRightRadius: borderRadiusSentinel,
      borderBottomRightRadius: borderRadiusSentinel
    },
    icon: {
      fontSize: fonts.fontSize.tl,
      color: colors.chevron
    },
    quantityCell: {
      alignItems: "center",
      alignSelf: "stretch",
      justifyContent: "center",
      paddingHorizontal: padding.xs
    },
    quantityText: {
      ...textAlign.tac,
      color: colors.black,
      fontSize: fonts.fontSize.sm - 1
    },
    quantityAmountCell: {
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: colors.white,
      width: 50,
      justifyContent: "center",
      marginTop: padding.xs - 1,
      paddingVertical: borderRadiusSentinel
    },
    quantityAmountCellNotSelectable: {
      backgroundColor: colors.itemQuantity
    },
    quantityAmountText: {
      ...textAlign.tac,
      color: colors.black,
      fontSize: fonts.fontSize.bt
    }
  },
  Theme.isTablet ? {
    selectCell: {
      flex: 0.03,
      justifyContent: "flex-start",
      paddingTop: padding.sm
    },
    itemLine: {
      maxWidth: tabletItemLineMaxWidth
    },
    notInSelectMode: {
      maxWidth: tabletItemLineMaxWidth
    },
    inSelectMode: {
      maxWidth: tabletItemLineMaxWidth
    }
  } : {
    item: {
      borderTopRightRadius: borderRadiusSentinel,
      borderBottomRightRadius: borderRadiusSentinel
    }
  });
};

export const discountLineStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    root: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderRadius: padding.xs,
      borderWidth: 1,
      marginTop: padding.sm - 2,
      marginHorizontal: Theme.isTablet ? 0 : padding.sm
    },
    detailsArea: {
      flex: 1,
      justifyContent: "space-between",
      padding: padding.sm - 2,
      paddingRight: 0
    },
    detailsRow: {
      flex: 1,
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap"
    },
    textCell: {
      maxWidth: "60%"
    },
    amountCell: {
      alignItems: "flex-end",
      alignSelf: "stretch",
      justifyContent: "flex-start"
    },
    bottomRowText: {
      fontSize: fonts.fontSize.sm - 1,
      color: colors.darkerGrey
    },
    rowText: {
      fontSize: fonts.fontSize.md,
      color: colors.black
    },
    voidIconArea: {
      justifyContent: "center",
      alignItems: "center",
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
    }
  };
};

export const couponLineStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    root: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderRadius: padding.xs,
      borderWidth: 1,
      marginTop: padding.sm - 2,
      marginHorizontal: Theme.isTablet ? 0 : padding.sm
    },
    detailsArea: {
      flex: 1,
      justifyContent: "space-between",
      padding: padding.sm - 2,
      paddingRight: 0
    },
    topRowText: {
      fontSize: fonts.fontSize.md - 1,
      color: colors.black
    },
    bottomRowText: {
      fontSize: fonts.fontSize.sm - 1,
      color: colors.darkerGrey
    },
    voidIconArea: {
      justifyContent: "center",
      alignItems: "center",
      padding: padding.sm
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    voidIcon: {
      color: colors.white,
      fontSize: fonts.fontSize.sm,
      padding: padding.xs - 3
    }
  };
};

export const taxExemptLineStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    root: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderRadius: padding.xs,
      borderWidth: 1,
      marginTop: padding.sm - 2,
      marginHorizontal: Theme.isTablet ? 0 : padding.sm
    },
    detailsArea: {
      flex: 1,
      justifyContent: "space-between",
      padding: padding.sm - 2,
      paddingRight: 0
    },
    topRowText: {
      fontSize: fonts.fontSize.md - 1,
      color: colors.black
    },
    bottomRowText: {
      fontSize: fonts.fontSize.sm - 1,
      color: colors.darkerGrey
    },
    voidIconArea: {
      justifyContent: "center",
      alignItems: "center",
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
    }
  };
};

export const tabletOptionListStyle = () => {
  const { miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    }
  };
};

export const optionListStyle = () => {
  const { colors, fonts, miscellaneous, padding, spacing } = Theme.styles;
  return Theme.merge({
    base: {
      ...miscellaneous.fill
    },
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    optionButton: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      width: "100%"
    },
    optionText: {
      fontSize: fonts.fontSize.fm,
      color: fonts.color
    },
    optionDescriptionText: {
      fontSize: fonts.fontSize.nw,
      color: fonts.color
    },
    optionDescriptionSubText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.nw
    },
    textInput: {
      height: fonts.fontSize.xl + 8,
      width: "100%",
      paddingLeft: padding.md,
      backgroundColor: colors.white,
      fontSize: fonts.fontSize.fm,
      lineHeight: fonts.fontSize.bt - 2,
      textAlign: "left",
      color: colors.darkGrey
    },
    header_footer_style: {
      width: "100%",
      height: fonts.fontSize.xl + 2 ,
      fontSize: fonts.fontSize.xs + 1,
      justifyContent: "center",
      backgroundColor: colors.lightGrey
    },
    headerTextStyle: {
      textAlign: "left",
      fontSize: fonts.fontSize.xs + 1,
      paddingLeft: padding.md,
      justifyContent: "center",
      lineHeight: fonts.fontSize.fm + 1,
      color: colors.darkGrey
    },
    checkIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.tl
    },
    disabledOption: {
      backgroundColor: colors.tagColor
    },
    disabledText: {
      color: colors.borderColor
    }
  }, Theme.isTablet ? tabletOptionListStyle() : {
    root: {
      paddingBottom: getBottomSpace()
    }
  });
};

export const tenderLineStyles = () => {
  const { colors, fonts, padding, spacing, textAlign } = Theme.styles;
  return ({
    ...textAlign,
    row: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: padding.sm - 2,
      paddingVertical: padding.xs
    },
    column: {
      flexDirection: "column",
      flexGrow: 3
    },
    foreignTenderRow: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: padding.sm - 2
    },
    voidableLine: {
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderRadius: padding.sm,
      borderWidth: 1,
      marginHorizontal: padding.sm,
      marginTop: padding.sm,
      padding: padding.sm
    },
    nonVoidableLine: {
      backgroundColor: colors.lighterGrey,
      borderColor: colors.grey,
      borderRadius: padding.sm,
      borderWidth: 1,
      marginHorizontal: padding.sm,
      marginTop: padding.sm,
      padding: padding.sm
    },
    disabled: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    textArea: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    textStyle: {
      fontSize: fonts.fontSize.sm
    },
    tenderTypeText: {
      flex: 2,
      ...textAlign.tal,
      paddingLeft: padding.sm
    },
    tenderAmountText: {
      flex: 1,
      ...textAlign.tar,
      paddingRight: padding.sm
    },
    foreignTenderText: {
      flex: 3,
      fontSize: fonts.fontSize.sm - 3,
      color: colors.darkGrey,
      paddingLeft: spacing.lg,
      paddingBottom: padding.xs
    },
    foreignLabelText: {
      flex: 2,
      fontSize: fonts.fontSize.sm - 2,
      color: colors.darkGrey,
      ...textAlign.tal,
      paddingTop: padding.xxs,
      paddingLeft: 2
    },
    foreignAmountText: {
      flex: 1,
      fontSize: fonts.fontSize.sm - 2,
      color: colors.darkGrey,
      ...textAlign.tar,
      paddingRight: 2,
      paddingTop: padding.xxs
    },
    voidIcon: {
      borderRadius: 50,
      color: colors.white,
      fontSize: fonts.fontSize.tl,
      padding: padding.xs - 2
    }
  });
};

export const tenderLineListStyles = () => {
  const { colors, fonts, padding } = Theme.styles;

  return ({
    root: {
      alignSelf: "stretch"
    },
    subtitleArea: {
      alignItems: "flex-start",
      justifyContent: "flex-end",
      borderTopColor: colors.grey,
      borderTopWidth: 1,
      marginTop: padding.sm,
      paddingTop: padding.sm - 2,
      paddingHorizontal: padding.md - 4,
      paddingBottom: padding.sm - 2
    },
    subtitleText: {
      color: colors.darkGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.xs
    }
  });
};

export const feeLineStyles = () => {
  const { colors, fonts, padding, spacing, textAlign } = Theme.styles;
  return ({
    ...textAlign,
    row: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.lightGrey,
      flexDirection: "row",
      justifyContent: "flex-start",
      padding: padding.sm,
      paddingVertical: padding.xs
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    textArea: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between"
    },
    textStyle: {
      fontSize: fonts.fontSize.s
    },
    feeTypeText: {
      flex: 2,
      ...textAlign.tal,
      paddingLeft: padding.sm - padding.xxs,
      fontSize: fonts.fontSize.sm
    },
    feeAmountText: {
      flex: 1,
      ...textAlign.tar,
      paddingRight: spacing.xs,
      fontSize: fonts.fontSize.sm
    },
    voidIcon: {
      backgroundColor: colors.darkerGrey,
      borderColor: colors.darkerGrey,
      borderRadius: 50,
      borderWidth: 1,
      color: colors.white,
      fontSize: fonts.fontSize.tl,
      padding: 3
    }
  });
};

export const feeLineListStyles = () => {
  const { colors, fonts, padding, spacing } = Theme.styles;

  return ({
    root: {
      alignSelf: "stretch"
    },
    subtitleArea: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderTopColor: colors.grey,
      borderTopWidth: 1,
      marginTop: padding.sm,
      padding: spacing.xs,
      paddingLeft: spacing.md
    },
    subtitleText: {
      color: colors.darkGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.nw
    }
  });
};

export const retryVoidAsRefundStyles = () => {
  const { buttons, colors, fonts, padding } = Theme.styles;

  return ({
    ...buttons,
    modalContainer: {
      alignItems: "center",
      backgroundColor: colors.overlay,
      flex: 1,
      justifyContent: "center"
    },
    modalView: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderRadius: 10
    },
    closeButtonContainer: {
      alignSelf: "stretch",
      justifyContent: "center",
      flexDirection: "row",
      marginHorizontal: padding.md
    },
    btnSecondary: {
      ...buttons.btnSeconday,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: padding.xs,
      marginBottom: padding.sm
    },
    btnSecondaryText: {
      ...buttons.btnSecondayText,
      fontSize: fonts.fontSize.sm,
      padding: padding.sm
    },
    btnPrimary: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: padding.xs,
      marginBottom: padding.sm
    },
    btnPrimaryText: {
      ...buttons.btnPrimaryText,
      fontSize: fonts.fontSize.sm,
      padding: padding.sm
    },
    closeButtonText: {
      color: colors.white,
      fontSize: fonts.fontSize.md
    },
    textPanel: {
      marginHorizontal: padding.md + 5,
      marginVertical: padding.md + 5
    }
  });
};

export const errorMessageStyles = () => {
  const { buttons, colors, fonts, padding } = Theme.styles;

  return ({
    ...buttons,
    modalContainer: {
      alignItems: "center",
      backgroundColor: colors.overlay,
      flex: 1,
      justifyContent: "center"
    },
    modalView: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderRadius: 10
    },
    closeButtonContainer : {
      alignSelf: "stretch",
      justifyContent: "center",
      flexDirection: "row",
      margin: padding.sm + 2,
      marginTop: padding.xs - 3
    },
    closeButton : {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.action,
      borderRadius: padding.xs + 1,
      justifyContent: "center",
      padding: padding.xs + 2,
      width : 120
    },
    closeButtonText: {
      color: colors.white,
      fontSize: fonts.fontSize.md
    },
    textPanel: {
      marginHorizontal: padding.md + 5,
      marginVertical: padding.md + 5
    },
    primaryText: {
      textAlign: "center"
    }
  });
};

export const productInquiryLineStyle = () => {
  const { colors, fonts, padding, textAlign } = Theme.styles;
  return Theme.merge({
    row: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      backgroundColor: colors.white,
      borderColor: Theme.isTablet ? colors.grey : colors.white,
      borderWidth: 1,
      borderRadius: padding.sm - 2,
      marginHorizontal: Theme.isTablet ? 0 : padding.sm - 2,
      marginVertical: padding.xs - 2,
      padding: padding.sm - 2
    },
    imageCell: {
      alignItems: "center",
      justifyContent: "center",
      paddingRight: padding.sm
    },
    imageSize: {
      height: Theme.isTablet ? 68 : 90,
      width: 60
    },
    details: {
      flex: 1
    },
    descriptionLine: {
      alignItems: "flex-start",
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between"
    },
    itemDescription: {
      flex: 2
    },
    itemAmount: {
      flex: 1
    },
    itemDescriptionText: {
      color: colors.black,
      flex: 1,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.regular
    },
    itemDetailsText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: padding.xs - 1
    },
    itemPriceText: {
      ...textAlign.tar,
      color: colors.black,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.semibold
    },
    itemSalePriceText: {
      ...textAlign.tar,
      color: colors.itemDiscountsText,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.semibold
    },
    itemPriceTextOverridden: {
      ...textAlign.tar,
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: padding.xs - 1,
      textDecorationLine: "line-through"
    },
    arrowArea: {
      alignItems: "stretch",
      justifyContent: "flex-end",
      paddingLeft: padding.xs
    },
    icon: {
      fontSize: fonts.fontSize.tl,
      color: colors.chevron
    }
  }, Theme.isTablet ? {
    itemDescriptionText: {
      fontSize: fonts.fontSize.fm
    },
    itemPriceText: {
      fontSize: fonts.fontSize.fm + 1
    }
  } : {});
};

export const carouselStyle = () => {
  const { colors, spacing } = Theme.styles;
  return{
    container: {
      flex: 1
    },
    dotPanel: {
      alignItems : "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: spacing.sm
    },
    dotOuter: {
      alignItems : "center",
      borderRadius: (spacing.md + 4) / 2,
      height: (spacing.md + 4),
      justifyContent: "center",
      width: (spacing.md + 4),
      marginHorizontal: spacing.xxs
    },
    dotFilter: {
      alignItems : "center",
      backgroundColor: colors.white,
      borderRadius: (spacing.md + 2) / 2,
      height: spacing.md + 2,
      justifyContent: "center",
      width: spacing.md + 2
    },
    dot: {
      borderRadius: spacing.sm / 2,
      height: spacing.sm,
      width: spacing.sm
    },
    dotSelected: {
      backgroundColor: colors.action
    },
    dotUnselected: {
      backgroundColor: colors.black,
      marginHorizontal: spacing.xxs
    },
    thumbnail: {
      borderColor: colors.borderColor,
      borderWidth: 1,
      padding: spacing.xxs  - 2,
      marginHorizontal: spacing.xxs
    },
    thumbnailSelected: {
      borderColor: colors.action
    }
  };
};

export const imageViewerStyle = () => {
  return{
    imageViewer: {
      alignItems: "center",
      alignSelf: "center",
      justifyContent: "center"
    }
  };
};

export const itemVariantsStyle = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    optionItemsContainer: {
      flexDirection: "row",
      flexWrap: "wrap"
    },
    itemContainer: {
      alignItems: "center",
      borderColor: colors.grey,
      borderWidth: 1,
      justifyContent: "center",
      marginRight: padding.sm - 2,
      marginTop: padding.sm - 2,
      padding: padding.sm - 2,
      minWidth: 25
    },
    itemContainerActive: {
      borderColor: colors.action
    },
    itemText: {
      color: colors.black,
      fontSize: fonts.fontSize.xs + 1
    },
    disableItem: {
      opacity: 0.2
    }
  };
};

export const footerStyle = () => {
  const { colors } = Theme.styles;
  return ({
    root: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.loginAndHeaderBackground,
      flexDirection: "row",
      justifyContent: "space-between",
      height: 50 + getBottomSpace(),
      paddingBottom: getBottomSpace()
    }
  });
};

export const toastPopUpStyles = () => {
  const { colors, fonts, padding, textAlign } = Theme.styles;
  return {
    root: {
      alignSelf: "center",
      justifyContent: "flex-start",
      alignItems: "center",
      position: "absolute",
      bottom: 0,
      maxWidth: Dimensions.get("window").width,
      marginHorizontal: padding.sm + padding.xs + 1,
      marginBottom: getBottomSpace() + padding.sm,
      paddingHorizontal: padding.md,
      paddingVertical: padding.sm,
      backgroundColor: colors.black,
      borderRadius: 50
    },
    displayedText: {
      ...textAlign.tac,
      flex: 1,
      color: colors.white,
      fontSize: fonts.fontSize.sm
    }
  };
};

export const dialogStyles = () => {
  const { colors, fonts, forms, textAlign, padding } = Theme.styles;
  return ({
    root: {
      flex: 1
    },
    modalContainer: {
      alignItems: "center",
      backgroundColor: colors.overlay,
      flex: 1,
      justifyContent: "center"
    },
    modalView: {
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor : colors.lighterGrey,
      width: 300,
      borderWidth: 1,
      borderColor: colors.lighterGrey,
      borderRadius: 14
    },
    infoContainer: {
      paddingHorizontal: padding.md,
      paddingVertical: padding.sm
    },
    heading: {
      ...textAlign.tac,
      color: fonts.color,
      fontSize: fonts.fontSize.fm,
      fontWeight: fonts.fontWeight.bold
    },
    subHeading: {
      ...textAlign.tac,
      marginTop: padding.xs,
      color: fonts.color,
      fontSize: fonts.fontSize.sm
    },
    errorText: {
      color: colors.bad,
      paddingTop: padding.xs
    },
    inputField: {
      height: forms.input.height,
      paddingHorizontal: padding.xs,
      width: "100%",
      borderColor: colors.grey,
      borderWidth: 1
    },
    formContainer: {
      marginVertical: padding.sm
    },
    field: {
      alignSelf: "stretch",
      paddingHorizontal: padding.xs
    },
    formSeprator: {
      height: 8,
      alignSelf: "stretch"
    },
    textInputError: {
      paddingLeft: padding.xs,
      paddingBottom: padding.xs
    },
    buttonContainer: {
      flexDirection: "row",
      height: 45,
      justifyContent: "center"
    },
    buttonStyle: {
      width: "49.5%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors.action
    },
    seprator: {
      width: 1,
      height: "100%",
      backgroundColor: colors.action
    },
    approveButtonStyle: {
      fontWeight: fonts.fontWeight.bold
    },
    buttonTextStyle: {
      ...textAlign.tac,
      color: colors.action,
      fontSize: fonts.fontSize.fm
    }
  });
};

export const itemSummaryLineStyles = () => {
  const { padding, colors, fonts } = Theme.styles;
  return ({
    line: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: padding.xs - 1
    },
    itemLineText: {
      color: colors.darkerGrey,
      flex: 1,
      fontSize: fonts.fontSize.sm - 1
    },
    itemLineId: {
      flex: 0.45,
      marginRight: padding.sm
    }
  });
};

export const loyaltyVoucherLineStyles = () => {
  const { colors, fonts, padding, textAlign } = Theme.styles;
  return {
    ...textAlign,
    row: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.grey,
      borderRadius: padding.sm - 2,
      flexDirection: "row",
      justifyContent: "center",
      marginHorizontal: padding.sm - 2,
      marginTop: padding.sm - 2,
      padding: padding.md - 4
    },
    loyaltyDetails: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flex: 2,
      justifyContent: "center"
    },
    applyLoyalty: {
      alignItems: "flex-end",
      alignSelf: "stretch",
      flex: 1,
      justifyContent: "center"
    },
    loyaltyAmountText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm,
      marginBottom: padding.xs - 1
    },
    loyaltyText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs + 1
    },
    applyLoyaltyText: {
      color: colors.action,
      fontSize: fonts.fontSize.md,
      paddingVertical: padding.sm,
      paddingLeft: padding.sm
    },
    appliedLoyaltyText: {
      color: colors.shadow,
      fontSize: fonts.fontSize.md
    }
  };
};


export const tabletCurrencyCalculatorStyle = () => {
  const { colors, padding } = Theme.styles;
  return {
    root: {
      marginBottom: padding.xs,
      borderBottomWidth: 2,
      borderColor: colors.lightGrey
    }
  };
};

export const currencyCalculatorStyles = () => {
  const { colors, forms, padding } = Theme.styles;
  return Theme.merge({
    root: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.sm
    },
    currency: {
      flex: 1,
      textAlign: "left"
    },
    input: {
      borderWidth: 1,
      paddingLeft: 0,
      textAlign: "center",
      width: forms.input.height * 2
    },
    total: {
      flex: 1,
      textAlign: "right"
    }}, Theme.isTablet ? tabletCurrencyCalculatorStyle() : {}
  );
};

export const statusTagStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return ({
    ...colors,
    statusTag: {
      backgroundColor: colors.tagColor,
      flexDirection: "row",
      paddingHorizontal: padding.xs + 1,
      paddingVertical: padding.xs - 3
    },
    statusTagCircle: {
      alignSelf: "center",
      borderRadius: (padding.sm - 2) / 2,
      height: padding.sm - 2,
      width: padding.sm - 2
    },
    statusTagText: {
      alignSelf: "center",
      color: colors.darkestGrey,
      fontSize: fonts.fontSize.nw,
      marginLeft: padding.xs - 1,
      textAlign: "left"
    },
    statusIcon: {
      color: Color(colors.black).alpha(0.6).toString(),
      fontSize: 16
    }
  });
};

export const tabletMembershipStatusIndicatorStyles = () => {
  const { padding } = Theme.styles;
  return {
    statusTag: {
      marginBottom: padding.xs - 4,
      marginLeft: padding.xs
    }
  };
};

export const membershipStatusIndicatorStyles = () => {
  const { colors, padding } = Theme.styles;

  return Theme.merge({
    root: {
      alignSelf: "stretch"
    },
    rowView: {
      flexDirection: "row"
    },
    statusTag: {
      marginBottom: padding.xs + 2
    },
    statusTagCircleActive: {
      backgroundColor: colors.good
    },
    statusTagCirclePending: {
      backgroundColor: colors.caution
    },
    statusTagCircleTerminated: {
      backgroundColor: colors.bad
    }
  }, Theme.isTablet ? tabletMembershipStatusIndicatorStyles() : {}
  );
};

export const loyaltyMembershipStyles = () => {
  const { colors, fonts, padding, textAlign } = Theme.styles;
  return ({
    ...textAlign,
    root: {
      alignSelf: "stretch",
      alignItems: "center",
      backgroundColor: colors.lightGrey,
      justifyContent: "center",
      paddingHorizontal: padding.md - 4,
      paddingTop: padding.md - 4
    },
    row: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: padding.xs - 1
    },
    extraPadding: {
      paddingBottom: padding.xs - 1
    },
    text: {
      flex: 2,
      fontSize: fonts.fontSize.nw
    },
    value: {
      ...textAlign.tar,
      flex: 1,
      fontSize: fonts.fontSize.nw
    },
    textBold: {
      fontWeight: fonts.fontWeight.bold
    }
  });
};

export const loyaltyMembershipListStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return ({
    root: {
      alignSelf: "stretch"
    },
    subtitleArea: {
      alignItems: "flex-start",
      justifyContent: "flex-end",
      backgroundColor: colors.lightGrey,
      borderTopColor: colors.grey,
      borderTopWidth: 1,
      marginTop: padding.sm,
      paddingTop: padding.sm - 2,
      paddingHorizontal: padding.md - 4
    },
    subtitleText: {
      color: colors.darkGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.xs
    }
  });
};

export const loyaltyRedemptionStyles = () => {
  const { colors, fonts, miscellaneous, padding, textAlign } = Theme.styles;
  return ({
    ...miscellaneous,
    ...textAlign,
    listArea: {
      alignSelf: "stretch"
    },
    subtitleArea: {
      alignSelf: "stretch",
      borderColor: colors. grey,
      borderTopWidth: 1,
      marginTop: padding.md + 4
    },
    subtitleText: {
      color: colors.darkestGrey,
      fontSize: fonts.fontSize.nw,
      marginTop: padding.sm - 2,
      paddingHorizontal: padding.md - 4
    },
    root: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      flexDirection: "row",
      paddingVertical: padding.sm - 2,
      paddingHorizontal: padding.md - 4
    },
    bottomBorder: {
      borderColor: colors.grey,
      borderBottomWidth: 1
    },
    roundedBorder: {
      borderColor: colors.grey,
      borderWidth: 1,
      borderRadius: padding.sm - 2
    },
    textPanel: {
      flex: 1
    },
    amountPanel: {
      flexDirection: "row"
    },
    amountText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.fm
    },
    descriptionText: {
      color: colors.darkestGrey,
      fontSize: fonts.fontSize.nw,
      marginTop: padding.xs
    },
    mainPanel: {
      ...miscellaneous.fill,
      paddingHorizontal: padding.sm - 2
    },
    voidablePanel: {
      paddingTop: padding.sm - 2
    },
    voidable: {
      alignItems: "center",
      justifyContent: "center"
    },
    voidIcon: {
      color: colors.white,
      fontSize: fonts.fontSize.xxs,
      marginLeft: padding.sm - 2,
      padding: padding.xs - 2
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkGrey
    }
  });
};

export const customerTagListStyles = () => {
  const { colors, padding } = Theme.styles;
  return ({
    ...colors,
    root: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      paddingHorizontal: padding.xs - 1,
      paddingBottom: padding.sm - 2,
      justifyContent: "flex-start"
    },
    multiLine: {
      flexWrap: "wrap"
    },
    statusTag: {
      marginHorizontal: padding.xs - 1
    },
    statusTagMultiLine: {
      marginHorizontal: padding.xs - 1,
      marginBottom: padding.sm
    }
  });
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
      borderRadius: padding.sm - 2,
      marginHorizontal: Theme.isTablet ? 0 : padding.sm - 2,
      marginVertical: padding.xs - 2,
      padding: padding.sm - 2
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
      marginBottom: padding.xs - 1
    },
    transactionText: {
      color: colors.black,
      fontSize: fonts.fontSize.sm + 1
    },
    attributeText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    arrowArea: {
      alignItems: "stretch",
      justifyContent: "flex-end",
      paddingLeft: padding.xs
    },
    icon: {
      fontSize: fonts.fontSize.tl,
      color: colors.chevron
    }
  };
};

export const customerTransactionHistoryStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    transaction: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      backgroundColor: colors.white,
      borderColor: Theme.isTablet ? colors.grey : colors.white,
      borderWidth: 1,
      borderRadius: padding.sm - 2,
      marginHorizontal: Theme.isTablet ? 0 : padding.sm - 2,
      marginVertical: padding.xs - 2,
      padding: padding.sm - 2
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
      marginBottom: padding.xs - 1
    },
    transactionStoreRow: {
      marginBottom: 0,
      alignSelf: "flex-start",
      justifyContent: "flex-start"
    },
    transactionRefRow: {
      borderBottomWidth: 1,
      borderColor: colors.grey,
      paddingBottom: padding.xs
    },
    transactionText: {
      color: colors.black,
      fontSize: fonts.fontSize.sm + 1
    },
    transactionStoreText: {
      fontSize: fonts.fontSize.xxs,
      fontWeight: fonts.fontWeight.bold
    },
    transactionRefText: {
      color: colors.action,
      fontSize: fonts.fontSize.md,
      fontWeight: fonts.fontWeight.semibold
    },
    attributeText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    arrowArea: {
      alignItems: "stretch",
      justifyContent: "flex-end",
      paddingLeft: padding.xs
    },
    icon: {
      fontSize: fonts.fontSize.fm,
      color: colors.chevron
    }
  };
};

export const cameraStyle = () => {
  const { colors, padding, fonts } = Theme.styles;
  return ({
    container: {
      backgroundColor: colors.black,
      height: "100%"
    },
    preview: {
      flex: 1,
      alignItems: "center"
    },
    captureArea: {
      bottom:0,
      flexDirection: "column",
      justifyContent: "center",
      position: "absolute",
      alignItems: "center",
      alignSelf: "center"
    },
    capture: {
      backgroundColor: colors.white,
      borderRadius: padding.sm,
      padding: padding.sm,
      paddingHorizontal: padding.sm,
      alignSelf: "center",
      margin: padding.sm
    },
    cameraIconStyle: {
      height: padding.md,
      width: padding.md,
      color: colors.black,
      backgroundColor: colors.transparent,
      fontSize: fonts.fontSize.md
    },
    imageArea:{
      alignItems: "center",
      margin: padding.sm,
      justifyContent: "center"
    },
    image: {
      height: 140,
      width: 140
    },
    textIconArea: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: padding.sm
    },
    subtitleText: {
      flex: 1,
      alignItems: "flex-start",
      color: fonts.colors,
      fontSize: fonts.fontSize.sm
    },
    deleteIconArea: {
      flex: 1,
      alignItems: "flex-end"
    },
    deleteIconStyle: {
      height: padding.md + 3,
      width: padding.md + 3,
      color: fonts.color,
      backgroundColor: colors.transparent,
      fontSize: fonts.fontSize.md
    },
    searchIcon: {
      textAlign: "center",
      justifyContent: "center",
      flex:1
    },
    searchIconStyle: {
      height: padding.md + 3,
      width: padding.md + 3,
      color: colors.white,
      backgroundColor: colors.transparent,
      fontSize: fonts.fontSize.md
    },
    overlay: {
      position: "absolute",
      height: 140,
      width: 140,
      backgroundColor: colors.transparent,
      alignItems: "center"
    }
  });
};

export const feedbackNoteStyle = (messageType?: FeedbackNoteType) => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  const caution = {
    cautionPanel: {
      alignSelf: "stretch",
      borderColor: colors.transparent,
      flexDirection: "row",
      borderLeftWidth: 4,
      paddingRight: padding.sm,
      paddingLeft: padding.xs
    },
    cautionIcon: {
      fontSize: fonts.fontSize.bt
    }
  };
  let messageTypeStyles = {};
  if (messageType === FeedbackNoteType.Warning || messageType === FeedbackNoteType.Notification) {
    messageTypeStyles = {
      cautionPanel: {
        ...caution.cautionPanel,
        backgroundColor: Color(colors.caution).alpha(0.1).toString(),
        borderLeftColor: colors.caution
      },
      cautionIcon: {
        ...caution.cautionIcon,
        color: colors.caution
      }
    };
  } else if (messageType === FeedbackNoteType.Info) {
    messageTypeStyles = {
      cautionPanel: {
        ...caution.cautionPanel,
        backgroundColor: Color(colors.info).alpha(0.1).toString(),
        borderLeftColor: colors.info
      },
      cautionIcon: {
        ...caution.cautionIcon,
        color: colors.info
      }
    };
  } else {
    messageTypeStyles = {
      cautionPanel: {
        ...caution.cautionPanel,
        backgroundColor: Color(colors.bad).alpha(0.1).string(),
        borderLeftColor: colors.returnHeaderBackground
      },
      cautionIcon: {
        ...caution.cautionIcon,
        color: colors.returnHeaderBackground
      }
    };
  }

  return Theme.merge({
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    cautionText: {
      color: colors.black,
      textAlign: "left",
      fontFamily: fonts.fontFamily,
      fontSize: fonts.fontSize.nw,
      padding: padding.sm
    },
    cautionSubTitleText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs
    },
    cautionIconPadding: {
      paddingVertical: padding.sm
    }
  }, messageTypeStyles);
};

export const quickChoiceAmountsStyles = () => {
  const { buttons, colors, fonts, padding, spacing } = Theme.styles;
  return ({
    button: {
      flex: 1,
      marginLeft: padding.md - 4
    },
    choiceRow: {
      paddingHorizontal: spacing.md,
      flexDirection: "row",
      alignSelf: "stretch",
      justifyContent: "flex-start",
      paddingVertical: spacing.md,
      backgroundColor: colors.white,
      alignItems: "center",
      flexWrap: "wrap"
    },
    choiceButton: {
      ...buttons.btnSeconday,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.xs,
      marginBottom: spacing.xs
    },
    activeChoiceButton: {
      ...buttons.btnPrimary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.xs,
      marginBottom: spacing.xs
    },
    choiceButtonText: {
      ...buttons.btnSecondayText,
      fontSize: fonts.fontSize.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: fonts.fontSize.sm
    },
    activeChoiceButtonText: {
      ...buttons.btnPrimaryText,
      fontSize: fonts.fontSize.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: fonts.fontSize.sm
    }
  });
}

export const cameraScannerInputStyles = () => {
  const { colors, fonts, forms, padding } = Theme.styles;
  return Theme.merge({
    inputPanel: {
      alignSelf: "stretch",
      margin: 0,
      padding: 0,
      minHeight: forms.input.height - padding.xs
    },
    inputField: {
      height: "100%",
      alignItems: "center",
      backgroundColor: forms.input.backgroundColor,
      color: colors.textColor,
      borderColor: colors.inputFieldBorderColor,
      borderRadius: padding.xs,
      fontSize: fonts.fontSize.md,
      borderWidth: 1,
      position: "absolute",
      width: "95%"
    },
    closedTerminalStyles: {
      backgroundColor: Color(colors.black).fade(0.96).toString(),
      color: Color(colors.black).fade(0.62).toString()
    },
    cameraIconPanel: {
      alignItems: "center",
      backgroundColor: colors.action,
      borderWidth: 0,
      justifyContent: "center",
      width: 56,
      height: 56,
      position: "absolute",
      right: 0,
      borderTopRightRadius: 28,
      borderBottomRightRadius: 28,
      borderRadius: 28,
      boxSizing: "border-box",
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.24,
      shadowRadius: 3,
      elevation: 3
    },
    cameraIcon: {
      color: colors.white,
      fontSize: fonts.fontSize.bt
    },
    closedTerminalCameraIconStyles: {
      backgroundColor: "#F3F3F3",
      color: Color(colors.black).fade(0.62).toString()
    },
    placeholderStyle: colors.placeholderTextColor,
    transparentBackground: {
      backgroundColor: colors.transparent
    }
  }, Theme.isTablet ? {} : phoneCameraScannerInputStyles());
};

export const phoneCameraScannerInputStyles = () => {
  const { spacing } = Theme.styles;
  return ({
    inputPanel: {
      marginHorizontal: spacing.xs,
      marginTop: spacing.md,
      marginBottom: spacing.md
    },
    inputField: {
      paddingRight: 28 + spacing.xs,
      marginRight: 28 + spacing.md
    },
    cameraIconPanel: {
      marginBottom: spacing.sm
    }
  });
}

export const detailHeaderStyles = () => {
  const { colors, spacing, fonts } = Theme.styles;
  return Theme.merge({
    detailMainHeader: {
      backgroundColor: colors.white
    },
    detailHeaderContainer: {
      marginTop: spacing.md,
      marginLeft: spacing.md,
      marginRight: spacing.md,
      marginBottom: spacing.md
    },
    detailRowsContainer: {
      marginTop: spacing.sm
    },
    detailHeaderElementContainer: {
      flexDirection: 'row',
      flexWrap: "wrap",
      marginBottom: spacing.xxs
    },
    detailHeaderRowNameText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.nw
    },
    detailHeaderRowValueText: {
      fontSize: fonts.fontSize.nw
    },
    detailHeaderName: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xxs,
      fontWeight: fonts.fontWeight.semibold
    },
    detailHeaderValue: {
      fontSize: fonts.fontSize.fm
    },
    containerHeader: {
      flexDirection: "row",
      marginBottom: spacing.xs
    },
    containerHeaderValue: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap"
    },
    containerHeaderIcon: {
    }
  }, Theme.isTablet ? detailHeaderTabletStyles() : detailHeaderPhoneStyles() );
}

export const detailHeaderPhoneStyles = () => {
  return ({
    detailHeaderNameElement: {
      width: "40%"
    },
    detailHeaderValueElement: {
      width: "60%"
    }
  });
}

export const detailHeaderTabletStyles = () => {
  return ({
    detailHeaderNameElement: {
      width: "40%"
    },
    detailHeaderValueElement: {
      width: "60%"
    }
  });
}
