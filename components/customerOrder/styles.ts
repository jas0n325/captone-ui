import {getBottomSpace, isIphoneX} from "react-native-iphone-x-helper";
import Color = require("color");
import Theme from "../../styles";


const phoneCustomerOrderDisplayStyles = () => {
  const { spacing } = Theme.styles;
  return {
    customerOrderData: {
      alignItems: "flex-start",
      flexDirection: "column",
      justifyContent: "center"
    },
    infoContainer: {
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxs
    },
    fulfillmentInfoContainer: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md
    },
    trackingInfoContainer: {
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.md
    },
    storeTermElement: {
      width: "50%",
      paddingBottom: spacing.xs
    }
  };
};

const tabletCustomerOrderDisplayStyles = () => {
  const { colors, miscellaneous, spacing } = Theme.styles;
  return {
    scroll: {
      ...miscellaneous.fill,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md
    },
    fulfillmentGroupContainer: {
      backgroundColor: colors.white
    },
    customerOrderData: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    listHeader: {
      padding: spacing.xs,
      marginTop: spacing.md
    },
    fulfillmentInfoContainer: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md
    },
    infoContainer: {
      backgroundColor: colors.white,
      padding: spacing.sm
    },
    storeTermElement: {
      width: "33%"
    }
  };
};

export const customerOrderDisplayStyles = () => {
  const { buttons, colors, fonts,
    inputHeight, miscellaneous, spacing, textAlign, cards } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...textAlign,
    ...miscellaneous,
    ...cards,
    scroll: {
      ...miscellaneous.fill
    },
    actions: {
      borderRadius: 4,
      borderColor: colors.action,
      borderWidth: 1
    },
    header: {
      backgroundColor: colors.white
    },
    headerLine: {
      alignSelf: "stretch",
      justifyContent: "center"
    },
    contentContainer: {
      ...miscellaneous.screen
    },
    separatorLineTop: {
      borderColor: colors.borderColor,
      borderTopWidth: 1
    },
    customerOrderRow: {
      alignItems: "center",
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    storeTermText: {
      color: colors.black
    },
    contactText:{
      color: colors.darkGrey,
      fontSize: fonts.fontSize.md
    },
    listHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-end",
      paddingBottom: spacing.md,
      paddingTop: spacing.xs,
      padding: spacing.md
    },
    listHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.bold
    },
    quantityButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      height: inputHeight,
      width: 40,
      backgroundColor: colors.lightGrey,
      paddingTop: spacing.xs
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
      paddingVertical: 10,
      paddingHorizontal: 0,
      borderBottomWidth: 0,
      backgroundColor: colors.lightGrey
    },
    changeQuantityText: {
      color: fonts.color,
      fontSize: fonts.fontSize.sm
    },
    oldTransactionQuantityText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xxs
    },
    groupSeparator: {
      backgroundColor: colors.lightGrey,
      padding: spacing.sm
    },
    descriptionCellLine: {
      alignItems: "center",
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between"
    },
    checkBoxArea: {
      paddingTop: spacing.xs,
      paddingLeft: spacing.xs
    },
    checkBox: {
      enabledColor: colors.action,
      disabledColor: colors.darkGrey,
      height: spacing.lg
    },
    itemDisabled: {
      opacity: 0.4
    },
    itemDescriptionText: {
      color: colors.black,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.regular
    },
    itemContainer: {
      flexDirection: "row",
      alignSelf: "stretch",
      marginBottom: spacing.xs
    },
    itemSection: {
      flexDirection: "row",
      alignSelf: "stretch",
      justifyContent: "space-between"
    },
    attributeSection: {
      flexDirection: "column",
      alignItems: "flex-start"
    },
    priceSection: {
      flexDirection: "column",
      alignItems: "flex-start"
    },
    itemDetailsText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: spacing.xxs,
      alignSelf: "flex-end"
    },
    attributeText: {
      fontSize: fonts.fontSize.nw,
      color: colors.darkGrey,
      flex: 1
    },
    itemQuantityText: {
      ...textAlign.tar,
      color: colors.black,
      fontSize: fonts.fontSize.sm - 1,
      fontWeight: fonts.fontWeight.semibold,
      paddingTop: spacing.xxs
    },
    itemPriceText: {
      ...textAlign.tar,
      color: colors.black,
      fontSize: fonts.fontSize.md - 1,
      fontWeight: fonts.fontWeight.semibold,
      paddingTop: spacing.xxs
    },
    tagLine: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing.xs,
      paddingTop: spacing.xs
    },
    tagCell: {
      alignItems: "center",
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-start",
      paddingHorizontal: spacing.sm + 2,
      marginBottom: spacing.sm
    },
    detailsText: {
      color: colors.darkGrey
    },
    refLabel: {
      color: colors.black,
      fontSize: fonts.fontSize.nw
    },
    refId: {
      color: colors.black,
      fontSize: fonts.fontSize.tl
    },
    refContainer: {
      marginBottom: spacing.xs - 3
     },
    custInfoContainer: {
      marginBottom: spacing.sm + 2
    },
    custContainer: {
      flexDirection: 'row'
    },
    custLabel: {
      color: colors.black,
      fontSize: fonts.fontSize.md - 1
    },
    custDate: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.md - 1
    },
    storeTermContainer: {
      borderTopColor: colors.grey,
      borderTopWidth: spacing.xxs - 3
    },
    storeTermElementContainer: {
      flexDirection: 'row',
      flexWrap: "wrap",
      marginTop: spacing.xs
    },
    headerInfoLabel: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.nw
    },
    storeLabel: {
      color: colors.black,
      fontSize: fonts.fontSize.nw
    },
    storeText: {
      color: colors.darkGrey
    }
  }, Theme.isTablet ? tabletCustomerOrderDisplayStyles() : phoneCustomerOrderDisplayStyles());
};

export const baseViewFill = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};

export const orderInquiryScreenStyle = () => {
  const {
    buttons,
    colors,
    fonts,
    forms,
    miscellaneous,
    padding,
    spacing
  } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    fill: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      paddingBottom: getBottomSpace()
    },
    detailsText: {
      fontSize: fonts.fontSize.sm,
      paddingTop: spacing.md
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
    cameraIconPanel: {
      backgroundColor: colors.white,
      borderColor: colors.darkGrey,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomWidth: 1,
      height: forms.input.height,
      width: 50
    },
    menuIcon: {
      color: colors.navigationText,
      fontSize: fonts.fontSize.lg,
      paddingTop: spacing.xs - 3
    },
    cameraIcon: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    },
    orderErrorArea: {
      alignItems: "center",
      justifyContent: "space-around",
      marginTop: spacing.sm
    },
    errorContainer: {
      alignItems: "stretch",
      backgroundColor: Color(colors.bad).alpha(0.1).toString(),
      borderLeftWidth: padding.xs,
      borderColor: colors.bad,
      margin: !Theme.isTablet ? padding.xs : 0,
      paddingVertical: padding.sm,
      paddingRight: padding.xs,
      width: "90%"
    },
    errorMessageView: {
      flexDirection: "row",
      alignItems: "stretch",
      marginLeft: padding.xs,
      marginRight: padding.sm,
      paddingRight: padding.sm
    },
    errorMessageText: {
      color: colors.textColor,
      fontSize: fonts.fontSize.sm,
      textAlign: "left",
      lineHeight: padding.md,
      marginTop: !Theme.isTablet && padding.xxs - 2,
      padding: padding.xs,
      paddingRight: padding.xs
    },
    subErrorMessageText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.xs,
      textAlign: "left",
      lineHeight: padding.md,
      paddingLeft: padding.xs,
      paddingRight: padding.xs,
      paddingBottom: padding.xs
    },
    imageView: {
      height: padding.md,
      width: padding.md,
      margin: padding.xs,
      alignItems: "center"
    },
    emptyText: {
      textAlign: "center",
      fontSize: fonts.fontSize.md
    },
    resultSection: {
      paddingTop: spacing.md,
      paddingHorizontal: spacing.xs
    },
    customerHistorySection: {
      alignItems: "center",
      borderColor: colors.grey,
      borderRadius: spacing.xxs,
      borderWidth: 1,
      backgroundColor: colors.white,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl
    },
    customerHistoryMessageText: {
      textAlign: "center",
      fontSize: fonts.fontSize.md
    },
    customerHistoryButtonContainer: {
      width: "100%"
    },
    feedbackNoteContainer: {
      paddingBottom: spacing.md
    }
  }, Theme.isTablet ? tabletOrderInquiryStyle() : {});
};

export const tabletOrderInquiryStyle = () => {
  const { colors, fonts, miscellaneous, spacing } = Theme.styles;
  return {
    fill: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      paddingBottom: getBottomSpace()
    },
    fieldWrapper: {
      marginBottom: spacing.lg
    },
    customerHistorySection: {
      alignItems: "center",
      borderColor: colors.grey,
      borderRadius: spacing.xs,
      borderWidth: 1,
      backgroundColor: colors.white,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl
    },
    customerHistoryMessageText: {
      textAlign: "center",
      fontSize: fonts.fontSize.md
    },
    root: {
      paddingTop: spacing.md,
      paddingHorizontal: "20%"
    },
    resultSection: {
      paddingTop: 0,
      paddingHorizontal: 0
    }
  };
};

export const orderDetailScreenStyle = () => {
  const { buttons, colors, fonts, miscellaneous, spacing } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill
    },
    menuIcon: {
      color: colors.navigationText,
      fontSize: fonts.fontSize.lg,
      paddingTop: spacing.xs - 3
    },
    doneArea: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "stretch",
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
    itemDisabled: {
      opacity: 0.4
    }
  }, Theme.isTablet ? tabletOrderDetailScreenStyle() : {});
};

export const tabletOrderDetailScreenStyle = () => {
  const { buttons, colors, spacing, miscellaneous } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start",
      flexDirection: "row"
    },
    buttonContainer: {
      backgroundColor: colors.white
    },
    rightPanel: {
      ...miscellaneous.actionPanel,
      padding: spacing.md,
      backgroundColor: colors.white
    },
    btnPrimary: {
      ...buttons.btnPrimary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.sm
    }
  };
};
