import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../styles";


export const tabletDiscountTypeSelectionStyles = () => {
  const { colors, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white
    },
    actionsPanel: {
      padding: 0
    },
    buttonPanel: {
      paddingVertical: padding.md - 4
    },
    discountHeader: {
      backgroundColor: colors.white,
      paddingTop: padding.md - 4,
      paddingLeft: padding.sm - 2
    }
  };
};

export const discountTypeSelectionStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    },
    actionsPanel: {
      alignSelf: "stretch",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: Theme.isTablet ? 0 : padding.sm - 2
    },
    actions: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between"
    },
    btnAction: {
      backgroundColor: Theme.isTablet ? buttons.btnAction.backgroundColor : colors.white,
      borderColor: Theme.isTablet ? buttons.btnAction.borderColor : colors.grey,
      borderRadius: 4,
      borderWidth: 1,
      fontSize: Theme.isTablet ? buttons.btnActionIcon.fontSize : fonts.fontSize.bt,
      height: Theme.isTablet ? buttons.btnAction.height : 96,
      width: Theme.isTablet ? buttons.btnAction.width : 96,
      justifyContent: "flex-start",
      marginBottom: padding.sm - 2,
      padding: padding.xs - 1
    },
    btnActionText: {
      fontSize: Theme.isTablet ? buttons.btnActionText.fontSize : fonts.fontSize.sm - 1
    },
    lastBtn: {
      height: Theme.isTablet ? buttons.btnAction.height : 96,
      width: Theme.isTablet ? buttons.btnAction.width : 96
    },
    discountHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xs - 1,
      padding: padding.md - 5,
      paddingBottom: padding.xs - 1
    },
    discountHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    discountList: {
      marginBottom: getBottomSpace()
    },
    buttonPanel: {
      alignSelf: "stretch"
    }
  }, Theme.isTablet ? tabletDiscountTypeSelectionStyles() : {});
};


export const tabletDiscountStyles = () => {
  const { colors, miscellaneous, padding } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white
    },
    togglerArea: {
      backgroundColor: colors.white,
      marginBottom: padding.sm - 2,
      marginTop: -padding.sm - 2,
      borderBottomWidth: 0,
      paddingHorizontal: 0
    },
    actions: {
      ...miscellaneous.panel,
      marginTop: padding.md - 4,
      marginBottom: padding.sm - 2
    },
    button: {
      justifyContent: "center",
      marginBottom: padding.sm - 2
    }
  };
};

export const phoneDiscountStyles = () => {
  const { colors, fonts, padding } = Theme.styles;
  //Maximum number of selected item lines to show on the discount screen at one time
  const maxListElements = 4;

  const fontSize = fonts.fontSize.md - 1;
  const paddingBottom = padding.xs - 1;
  const listHeight = maxListElements * (fontSize + paddingBottom);
  return {
    itemLines: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderRadius: padding.sm - 2,
      marginTop: padding.xs - 1,
      marginHorizontal: padding.sm - 2,
      marginBottom: padding.md - 4,
      padding: padding.sm - 2
    },
    line: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom
    },
    itemLineTitle: {
      color: colors.black,
      flex: 1,
      fontSize
    },
    fullItemLineList: {
      maxHeight: listHeight
    }
  };
};

export const discountStyles = () => {
  const { buttons, colors, forms, fonts, miscellaneous, padding, spacing, textAlign } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...forms,
    ...miscellaneous,
    ...textAlign,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    },
    itemLine: {
      marginBottom: padding.md - 4
    },
    inputText: {
      alignSelf: "stretch"
    },
    inputTextBottomRoom: {
      marginBottom: spacing.md
    },
    errorText: {
      marginLeft: padding.xs - 1,
      paddingHorizontal: padding.md - 4,
      paddingBottom: padding.xs
    },
    reasonCodeButton: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderColor: forms.input.borderColor,
      flexDirection: "row",
      height: forms.input.height,
      justifyContent: "space-between",
      paddingHorizontal: padding.md - 4,
      width: "100%"
    },
    reasonCodeButtonText: {
      color: fonts.color,
      fontSize: fonts.fontSize.fm
    },
    togglerArea: {
      ...forms.input,
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      paddingHorizontal: padding.sm
    },
    togglerActive: {
      backgroundColor: colors.action,
      borderColor: colors.action,
      borderWidth: 1
    },
    togglerActiveText: {
      color: colors.white
    },
    togglerInactive: {
      backgroundColor: colors.white,
      borderColor: colors.action,
      borderWidth: 1
    },
    togglerInactiveText: {
      color: colors.action
    },
    employeeInfo: {
      marginTop: padding.xs,
      paddingHorizontal: padding.sm,
      color: colors.darkGrey
    },
    employeePicture: {
      size: 128
    },
    employeeInformationArea: {
      justifyContent: "center",
      backgroundColor: colors.white,
      paddingBottom: spacing.md
    },
    employeePictureBackground: {
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: colors.lightGrey,
      borderRadius: 64,
      fontSize: fonts.fontSize.tl * 2.5,
      justifyContent: "center",
      height: 128,
      marginTop: Theme.isTablet ? 0 : spacing.md,
      marginBottom: 0,
      width: 128
    },
    employeeInfoView: {
      borderColor: colors.lightGrey,
      borderBottomWidth: Theme.isTablet ? 1 : 0
    },
    employeeInfoHeader: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xxs,
      paddingLeft: spacing.md,
      paddingTop: spacing.xs
    },
    employeeInfoValue: {
      fontSize: fonts.fontSize.fm,
      paddingLeft: spacing.md
    }
  }, Theme.isTablet ? tabletDiscountStyles() : phoneDiscountStyles());
};

export const unusedCouponsScreenStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge(
    {
      ...buttons,
      root: {
        ...miscellaneous.fill
      },
      content: {
        alignSelf: "stretch",
        backgroundColor: colors.white,
        flex: 1
      },
      explanation: {
        color: colors.darkerGrey,
        fontSize: fonts.fontSize.sm - 1,
        paddingHorizontal: padding.md - 4,
        paddingBottom: padding.sm,
        paddingTop: padding.sm - 2
      },
      row: {
        backgroundColor: colors.white,
        borderBottomColor: colors.grey,
        borderBottomWidth: 1,
        paddingHorizontal: padding.md - 4,
        paddingBottom: padding.xs - 1,
        paddingTop: padding.sm - 2
      },
      couponText: {
        fontSize: fonts.fontSize.fm,
        marginBottom: padding.xs - 1
      },
      buttonArea: {
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: padding.md - 4,
        marginVertical: padding.lg + 2
      },
      button: {
        ...buttons.btnPrimary,
        alignItems: "center",
        justifyContent: "center"
      }
    }, Theme.isTablet ? {
        root: {
          paddingHorizontal: "20%",
          paddingVertical: padding.md - 4
        }
      } : {
        root: {
          paddingBottom: getBottomSpace()
        }
      }
  );
};

export const preConfiguredDiscountsScreenStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge(
    {
      ...buttons,
      root: {
        ...miscellaneous.fill
      },
      content: {
        alignSelf: "stretch",
        backgroundColor: colors.white,
        flex: 1
      },
      row: {
        backgroundColor: colors.white,
        borderBottomColor: colors.grey,
        borderBottomWidth: 1,
        paddingHorizontal: padding.md - 4,
        paddingBottom: padding.xs - 1,
        paddingTop: padding.sm - 2
      },
      discountText: {
        fontSize: fonts.fontSize.fm,
        padding: padding.xs,
        marginBottom: padding.xs - 1
      },
      appliedDiscounts: {
        backgroundColor: colors.lightGrey,
        flex: 1
      },
      appliedDiscountText: {
        fontSize: fonts.fontSize.nw,
        paddingTop: padding.xs,
        paddingLeft: padding.xs,
        paddingBottom: padding.xs,
        fontWeight: fonts.fontWeight.semibold,
        color: colors.darkestGrey
      },
      buttonArea: {
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: padding.md - 4,
        marginVertical: padding.lg + 2
      },
      discountList: {
        marginBottom: getBottomSpace()
      }
    }, Theme.isTablet ? {
        root: {
          paddingVertical: padding.md - 4
        },
        button: {
          ...buttons.btnSeconday,
          alignItems: "center",
          justifyContent: "center"
        },
        appliedDiscounts: {
          borderTopColor: colors.grey,
          borderTopWidth: 1,
          backgroundColor: colors.white
        }
      } : {
        root: {
          paddingBottom: getBottomSpace()
        }
      }
  );
};

export const discountScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
