import Theme from "../../styles";
import {getBottomSpace, isIphoneX} from "react-native-iphone-x-helper";

export const returnDetailsScreen = () => {
  const { buttons, colors, fonts, miscellaneous, padding, spacing, textAlign } = Theme.styles;

  return Theme.merge(
    {
      ...buttons,
      ...miscellaneous,
      ...textAlign,
      base: {
        ...miscellaneous.fill,
        backgroundColor: colors.lightGrey
      },
      root: {
        ...miscellaneous.fill
      },
      contentArea: {
        alignSelf: "stretch",
        backgroundColor: colors.lightGrey
      },
      doneArea: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: colors.lighterGrey,
        padding: spacing.xs,
        paddingBottom: spacing.sm + (isIphoneX ? getBottomSpace() : 0)
      },
      doneButton: {
        ...buttons.btnPrimary,
        alignItems: "center",
        flex: 1,
        justifyContent: "center"
      },
      doneText: {
        ...buttons.btnPrimaryText,
        fontSize: fonts.fontSize.fm
      },
      transactionHeaderArea: {
        alignSelf: "stretch",
        padding: padding.sm,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderColor: colors.grey
      },
      transactionNumber: {
        color: fonts.color,
        fontSize: fonts.fontSize.sm,
        fontWeight: fonts.fontWeight.semibold
      },
      headerText: {
        fontSize: fonts.fontSize.nw,
        marginTop: padding.xs
      },
      headerLabel: {
        color: colors.darkGrey
      },
      headerInfo: {
        color: colors.black
      },
      labelInfoPair: {
        alignSelf: "stretch",
        flexDirection: "row"
      },
      labelOrInfo: {
        ...miscellaneous.fill
      },
      itemListArea: {
        alignSelf: "stretch",
        padding: padding.sm,
        paddingBottom: padding.md
      },
      itemsLabel: {
        fontSize: fonts.fontSize.nw,
        marginTop: padding.xs,
        color: colors.darkGrey,
        marginLeft: padding.sm,
        marginBottom: padding.md
      },
      itemContainer: {
        flexDirection: "row",
        alignSelf: "stretch",
        marginBottom: padding.sm
      },
      checkBoxArea: {
        paddingTop: padding.xs
      },
      checkBox: {
        color: colors.action,
        height: padding.md + padding.xs
      },
      itemDisabled: {
        opacity: 0.4
      },
      itemArea: {
        ...miscellaneous.fill,
        backgroundColor: colors.white,
        borderRadius: padding.xs,
        borderWidth: 1,
        borderColor: colors.grey,
        padding: padding.sm
      },
      topHalf: {
        alignSelf: "stretch",
        flexDirection: "row"
      },
      imageArea: {
        height: "100%",
        width: 60,
        marginRight: spacing.xs
      },
      imageSize: {
        height: Theme.isTablet ? 68 : 90,
        width: 60
      },
      itemDetailsArea: {
        ...miscellaneous.fill
      },
      descriptionAndQuantityArea: {
        flexDirection: "row"
      },
      itemDescription: {
        color: fonts.color,
        fontSize: fonts.fontSize.sm,
        marginRight: padding.sm
      },
      quantityButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        height: 40,
        width: 40,
        backgroundColor: colors.lightGrey,
        paddingTop: padding.xs
      },
      removePadding: {
        paddingTop: 0
      },
      numericInputStylesToUndo: {
        height: undefined,
        width: undefined,
        flex: 0,
        alignSelf: undefined,
        padding: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingVertical: 0,
        paddingHorizontal: 0,
        borderBottomWidth: 0,
        backgroundColor: colors.lightGrey
      },
      returnQuantityText: {
        color: fonts.color,
        fontSize: fonts.fontSize.sm
      },
      notReturnableLabelText: {
        paddingTop: padding.xs,
        fontSize: fonts.fontSize.sm
      },
      oldTransactionQuantityText: {
        color: colors.darkGrey,
        fontSize: fonts.fontSize.xxs
      },
      itemSection: {
        alignSelf: "stretch"
      },
      attributeText: {
        fontSize: fonts.fontSize.nw,
        color: colors.darkGrey
      },
      itemBottomSection: {
        alignItems: "flex-end"
      },
      minimizedText: {
        fontSize: fonts.fontSize.xs,
        color: colors.darkGrey
      },
      rowMargin: {
        marginTop: padding.xs
      },
      pricingInformationListArea: {
        alignSelf: "stretch",
        borderTopWidth: 0.5,
        borderColor: colors.grey,
        marginTop: padding.sm,
        paddingTop: padding.xs
      },
      pricingLabel: {
        flex: 2
      },
      pricingAmount: {
        flex: 3
      },
      row: {
        alignSelf: "stretch",
        flexDirection: "row",
        alignItems: "flex-start"
      },
      totalPriceText: {
        color: fonts.color,
        fontSize: fonts.fontSize.sm,
        fontWeight: fonts.fontWeight.semibold,
        textAlign: "right",
        marginTop: padding.xs
      },
      footerArea: {
        alignSelf: "stretch",
        margin: padding.sm
      },
      transactionTotals: {
        backgroundColor: colors.white
      },
      tenderList: {
        paddingHorizontal: padding.sm,
        backgroundColor: colors.white
      },
      cameraIcon: {
        color: colors.darkerGrey,
        fontSize: fonts.fontSize.bt
      },
      inputStyle: {
        borderTopLeftRadius: padding.xs,
        borderBottomLeftRadius: padding.xs,
        height: 32,
        padding: 0
      },
      cameraIconPanel: {
        borderColor: colors.grey,
        borderBottomWidth: 1,
        height: 32
      }
    },
    Theme.isTablet
      ? {
        root: {
          ...miscellaneous.screen
        },
        doneArea: {
          backgroundColor: colors.white
        }
      }
      : {}
  );
};

export const returnReceiptScreenStyles = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing } = Theme.styles;

  return Theme.merge(
    {
      ...buttons,
      root: {
        ...miscellaneous.fill
      },
      base: {
        ...miscellaneous.fill,
        backgroundColor: colors.lightGrey
      },
      inputArea: {
        alignSelf: "stretch",
        marginBottom: padding.md,
        marginHorizontal: 0,
        padding: 0
      },
      cameraIcon: {
        color: colors.darkerGrey,
        fontSize: fonts.fontSize.bt
      },
      cameraIconPanel: {
        backgroundColor: colors.white,
        borderColor: colors.grey,
        borderBottomWidth: 1,
        height: forms.input.height,
        width: 50
      },
      returnArea: {
        ...miscellaneous.fill,
        backgroundColor: colors.white
      },
      returnOptionsArea: {
        alignSelf: "stretch",
        backgroundColor: colors.white,
        paddingTop: spacing.xxs,
        paddingHorizontal: spacing.sm
      },
      returnOptionButton: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: spacing.xxs
      },
      returned: {
        ...miscellaneous.fill,
        backgroundColor: colors.white,
        paddingTop: spacing.xxs,
        alignSelf: "stretch",
        borderTopWidth: 0.5,
        borderColor: colors.grey,
        marginTop: spacing.lg,
        paddingHorizontal: spacing.sm
      },
      returnedLabel: {
        color: colors.darkestGrey,
        fontSize: fonts.fontSize.nw,
        fontWeight: fonts.fontWeight.semibold,
        paddingTop: spacing.xxs,
        paddingLeft: spacing.xxs,
        paddingBottom: spacing.xs
      },
      returnedTransaction: {
        alignSelf: "stretch",
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderColor,
        borderRadius: 8,
        justifyContent: "center",
        marginTop: spacing.xs,
        padding: spacing.xs
      },
      returnedTransactionTitle: {
        color: colors.black,
        fontSize: fonts.fontSize.xs,
        fontWeight: fonts.fontWeight.semibold
      },
      returnedTransactionNumber: {
        color: colors.black,
        fontSize: fonts.fontSize.sm + 1,
        paddingTop: spacing.xxs
      },
      returnedTransactionDate: {
        color: colors.placeholderTextColor,
        fontSize: fonts.fontSize.nw,
        paddingTop: spacing.xxs
      }
    },
    Theme.isTablet
      ? {
        base: {
          ...miscellaneous.screen
        }
      }
      : {}
  );
};

export const returnSearchStyles = () => {
  const { colors, fonts, forms, miscellaneous, padding } = Theme.styles;

  return Theme.merge(
    {
      ...miscellaneous,
      base: {
        ...miscellaneous.fill
      },
      root: {
        ...miscellaneous.fill,
        backgroundColor: colors.white
      },
      inputArea: {
        alignSelf: "stretch",
        backgroundColor: colors.lightGrey,
        marginHorizontal: 0,
        padding: 0,
        paddingBottom: padding.md
      },
      cameraIcon: {
        color: colors.darkerGrey,
        fontSize: fonts.fontSize.bt
      },
      cameraIconPanel: {
        backgroundColor: colors.white,
        borderColor: colors.grey,
        borderBottomWidth: 1,
        height: forms.input.height,
        width: 50
      },
      textInput: {
        alignSelf: "stretch"
      },
      textInputError: {
        paddingLeft: padding.xs,
        paddingBottom: padding.xs
      },
      dateFormat: {
        color: colors.darkGrey,
        fontSize: fonts.fontSize.xs,
        marginLeft: padding.md,
        marginTop: padding.xs
      }
    },
    Theme.isTablet
      ? {
        root: {
          ...miscellaneous.screen
        }
      }
      : {}
  );
};
