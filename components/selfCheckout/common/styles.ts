import Theme from "../../../styles";


export const scoBasketStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;
  return {
    basket: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      padding: padding.sm,
      paddingBottom: padding.md
    },
    basketHeaderArea: {
      width: "100%"
    },
    basketTitle: {
      fontSize: fonts.fontSize.lg + 2,
      fontWeight: fonts.fontWeight.medium
    },
    basketColumnLabelArea: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: padding.sm,
      paddingBottom: padding.xs,
      borderBottomColor: colors.darkGrey,
      borderBottomWidth: 1
    },
    basketColumnLabelText: {
      color: colors.darkGrey,
      fontWeight: fonts.fontWeight.light
    },
    itemListArea: {
      ...miscellaneous.fill
    },
    noItemsListArea: {
      ...miscellaneous.fill,
      justifyContent: "center",
      alignItems: "center"
    },
    emptyBasketText: {
      fontSize: fonts.fontSize.xl,
      fontWeight: fonts.fontWeight.light,
      color: colors.grey,
      marginTop: padding.sm
    },
    discountSection: {
      marginBottom: padding.md,
      marginTop: padding.sm
    }
  };
};

export const scoItemLineStyles = () => {
  const { colors, fonts, padding, textAlign } = Theme.styles;
  return {
    root: {
      flexDirection: "row",
      minHeight: 100,
      Width: "100%",
      marginTop: padding.sm
    },
    imageArea: {
      height: 75,
      width: 75,
      marginRight: padding.sm
    },
    itemDetailsArea: {
      flex: 2.8,
      marginRight: padding.sm
    },
    itemName: {
      fontSize: fonts.fontSize.bt
    },
    itemAttributes: {
      marginBottom: padding.xs
    },
    itemAttributeLabel: {
      fontSize: fonts.fontSize.md,
      fontWeight: fonts.fontWeight.bold
    },
    itemAttribute: {
      fontSize: fonts.fontSize.md
    },
    itemAttributeSeparator: {
      fontSize: fonts.fontSize.tl,
      fontWeight: fonts.fontWeight.black
    },
    itemKey: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.md
    },
    priceArea: {
      flex: 1,
      justifyContent: "center",
      alignItems: "flex-end"
    },
    priceAreaWithDiscount: {
      justifyContent: "flex-start"
    },
    deemphasizedText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm
    },
    lineAdjustmentRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignSelf: "stretch",
      marginTop: padding.xs
    },
    leftOfLineAdjustment: {
      ...textAlign.tal,
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "flex-end"
    },
    rightOfLineAdjustment: {
      ...textAlign.tar,
      justifyContent: "flex-end",
      alignItems: "flex-end"
    },
    lineAdjustmentText: {
      color: colors.itemDiscountsText,
      fontSize: fonts.fontSize.sm
    },
    itemAdjustmentsSeparator: {
      height: 1,
      width: 100,
      backgroundColor: colors.grey,
      marginTop: padding.xs,
      marginBottom: padding.xs
    },
    itemPrice: {
      fontSize: fonts.fontSize.bt
    }
  };
};

export const scoPopupStyles = () => {
  const { colors, padding } = Theme.styles;

  return {
    base: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.overlay
    },
    root: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      justifyContent: "center",
      alignItems: "center"
    },
    pressToCloseColor: {
      color: colors.transparent
    },
    hiddenButton: {
      position: "absolute",
      top: padding.lg,
      left: padding.lg,
      height: 60,
      paddingHorizontal: padding.xl
    },
    centerArea: {
      height: 450,
      width: 600,
      backgroundColor: colors.white
    }
  };
};

export const scoToggleModePopUpStyles = () => {
  const { colors, fonts, forms, miscellaneous, padding, textAlign } = Theme.styles;

  return {
    ...forms,
    root: {
      ...miscellaneous.fill,
      justifyContent: "space-between",
      alignItems: "center",
      padding: padding.md
    },
    textArea: {
      alignSelf: "stretch",
      alignItems: "center"
    },
    title: {
      fontSize: fonts.fontSize.lg + 8,
      fontWeight: fonts.fontWeight.bold,
      marginBottom: padding.md
    },
    generalText: {
      ...textAlign.tac,
      fontSize: fonts.fontSize.bt,
      paddingHorizontal: padding.lg
    },
    fieldArea: {
      width: "100%",
      paddingHorizontal: padding.xl
    },
    field: {
      alignSelf: "stretch"
    },
    fieldInput: {
      alignSelf: "stretch"
    },
    errorTextArea: {
      alignSelf: "stretch",
      justifyContent: "flex-start",
      alignItems: "center",
      minHeight: 20
    },
    errorText: {
      color: colors.bad
    },
    errorTextMain: {
      textAlign: "center"
    },
    buttonArea: {
      flexDirection: "row",
      alignSelf: "stretch",
      justifyContent: "center",
      alignItems: "center"
    },
    cancelButton: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: padding.md,
      paddingHorizontal: padding.xl * 2,
      borderColor: colors.darkerGrey,
      borderWidth: 1,
      borderRadius: 5,
      marginRight: padding.md
    },
    cancelButtonText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    },
    submitButton: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: padding.md,
      paddingHorizontal: padding.xl * 2,
      backgroundColor: colors.black,
      borderColor: colors.black,
      borderWidth: 1,
      borderRadius: 5
    },
    submitButtonText: {
      color: colors.white,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    }
  };
};

export const scoTotalBarStyles = () => {
  const { colors, fonts, padding } = Theme.styles;

  return {
    totalArea: {
      flexDirection: "row-reverse",
      justifyContent: "flex-start",
      alignSelf: "stretch",
      paddingTop: padding.md,
      borderTopColor: colors.darkGrey,
      borderTopWidth: 1
    },
    total: {
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginLeft: padding.lg
    },
    firstTotal: {
      marginLeft: padding.md
    },
    mainTotalText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm
    },
    mainAmountText: {
      color: colors.black,
      fontSize: fonts.fontSize.lg,
      fontWeight: fonts.fontWeight.semiBold
    },
    totalSeparator: {
      width: 1,
      height: "100%",
      backgroundColor: colors.grey,
      marginLeft: padding.md
    },
    secondaryTotalText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.fm
    },
    secondaryAmountText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    }
  };
};

export const scoFeeLineStyles = () => {
  const { colors, fonts, padding, textAlign } = Theme.styles;
  return {
    root: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: colors.lighterGrey,
      padding: padding.xs,
      borderLeftStyle: "solid",
      borderLeftWidth: 1,
      borderLeftColor: colors.darkGrey
    },
    bagFeeHeading: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    unitPrice: {
      fontSize: fonts.fontSize.md,
      ...textAlign.tar
    },
    totalPrice: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey,
      ...textAlign.tar
    }
  };
};

export const scoDiscountDisplayLinesStyles = () => {
  const { colors, fonts, textAlign, padding } = Theme.styles;
  return {
    root: {
      flexDirection: "column",
      justifyContent: "space-between",
      padding: padding.xs,
      backgroundColor: colors.lighterGrey,
      borderLeftStyle: "solid",
      borderLeftWidth: 1,
      borderLeftColor: colors.darkGrey
    },
    discountHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: fonts.fontSize.bt,
      color: colors.bad
    },
    discountLine: {
      flexDirection: "row",
      justifyContent: "space-between"
    },
    discountLineLabel: {
      width: "60%",
      fontSize: fonts.fontSize.xs,
      color: colors.darkerGrey,
      marginTop: padding.xs,
      ...textAlign.tal
    },
    discountLineTotal: {
      width: "40%",
      fontSize: fonts.fontSize.xs,
      color: colors.darkerGrey,
      marginTop: padding.xs
    },
    discountLineReason: {
      fontSize: fonts.fontSize.xs,
      fontWeight: fonts.fontWeight.regular,
      color: colors.darkerGrey
    },
    totalAmount: {
      fontSize: fonts.fontSize.bt,
      color: colors.bad
    }
  };
};
