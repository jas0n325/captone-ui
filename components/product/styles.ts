import { Dimensions } from "react-native";
import { getBottomSpace } from "react-native-iphone-x-helper";

import Color = require("color");
import Theme from "../../styles";


export const productScreenStyle = () => {
  const { colors, miscellaneous } = Theme.styles;
  return {
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: Theme.isTablet ? colors.white : colors.lightGrey
    }
  };
};

export const productInquiryScreenStyle = () => {
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
    addButton: {
      ...buttons.btnPrimary,
      alignItems: "center",
      justifyContent: "center",
      margin: padding.sm,
      marginTop: padding.md
    },
    addButtonText: {
      ...buttons.btnPrimaryText,
      fontSize: fonts.fontSize.fm
    },
    resultHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xs - 1,
      padding: padding.md - 5,
      paddingBottom: padding.xs - 1
    },
    resultHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    pagination: {
      flex: 1,
      flexDirection: "row",
      marginHorizontal: 4,
      marginVertical: 8
    },
    paginationButtonView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    paginationButton: {
      ...buttons.btnPrimary,
      flex: 1,
      margin: 4,
      backgroundColor: colors.white
    },
    paginationButtonTitle: {
      ...buttons.btnSecondayText,
      fontSize: fonts.fontSize.md
    }
  }, Theme.isTablet ? tabletProductStyle() : {});
};

export const tabletProductStyle = () => {
  const { colors, miscellaneous, padding, spacing } = Theme.styles;
  return {
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      paddingBottom: 0,
      paddingHorizontal: "20%",
      paddingTop: padding.md - 4
    },
    header: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "flex-start"
    },
    fieldWrapper: {
      paddingBottom: spacing.md
    }
  };
};

export const productInquiryDetailScreenStyle = () => {
  const { colors, fonts, miscellaneous } = Theme.styles;
  return Theme.merge({
    root: {
      ...miscellaneous.fill,
      alignItems: "center"
    },
    errorContainer: {
      ...miscellaneous.fill,
      alignItems: "center",
      justifyContent: "center"
    },
    errorText: {
      color: fonts.color,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.sm
    }
  }, Theme.isTablet ? {
    root: {
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      paddingBottom: 0,
      paddingHorizontal: "0%"
    }
  } : {});
};


const phoneProductInquiryDetailStyle = () => {
  const { colors, fonts, padding, spacing } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white,
      paddingBottom: getBottomSpace()
    },
    productDetail: {
      backgroundColor: colors.white,
      flexDirection: "column"
    },
    carousel: {
      marginTop: spacing.xs
    },
    imageCell: {
      height: 256
    },
    infoContainer: {
      backgroundColor: colors.white
    },
    subInfoContainer: {
      borderBottomWidth: 0,
      paddingBottom: 0,
      paddingTop: padding.md,
      paddingHorizontal: padding.md - 4
    },
    priceContainer: {
      borderBottomWidth: 0,
      paddingBottom: 0,
      paddingTop: padding.sm - 2,
      paddingHorizontal: padding.md - 4
    },
    subInfoWithVariants: {
      flexDirection: "column"
    },
    tab: {
      width: "50%"
    },
    description: {
      paddingHorizontal: 16,
      paddingBottom: 16
    },
    variantStaticLabel: {
      fontSize: fonts.fontSize.sm - 1
    },
    variantInfoLabel: {
      fontSize: fonts.fontSize.sm - 1
    }
  };
};

const tabletProductInquiryDetailStyle = () => {
  const { colors, fonts, padding, spacing } = Theme.styles;
  return {
    root: {
      backgroundColor: colors.white
    },
    fill: {
      flex: 1,
      marginLeft: padding.xxl
    },
    noImageFill: {
      marginLeft: "20%",
      marginRight: "20%",
      alignSelf: "stretch",
      width: "100%",
      flex: 1
    },
    productDetail: {
      flexDirection: "row",
      paddingHorizontal: "6%",
      paddingTop: spacing.md
    },
    carousel: {
      alignItems : "center",
      flex: 1,
      height: 425,
      justifyContent: "flex-start",
      marginTop: spacing.sm
    },
    imageCell: {
      height: 320
    },
    infoContainer: {
      marginBottom: padding.md - 4
    },
    subInfoContainer: {
      borderBottomWidth: 0,
      padding: 0,
      paddingBottom: padding.xs
    },
    title: {
      fontSize: fonts.fontSize.tl
    },
    description: {
      fontSize: fonts.fontSize.fm,
      paddingHorizontal: "20%"
    },
    tabs: {
      paddingHorizontal: "20%"
    },
    price: {
      fontSize: fonts.fontSize.fm,
      padding: 0,
      paddingTop: padding.xs,
      fontWeight: fonts.fontWeight.regular
    },
    priceOverridden: {
      textDecorationLine: "line-through",
      textDecorationStyle: "solid"
    },
    finalPrice: {
      color: colors.itemDiscountsText
    },
    priceContainer: {
      borderBottomWidth: 0,
      padding: 0,
      flexDirection: "row"
    },
    itemContainer: {
      alignItems: "center",
      borderColor: colors.grey,
      borderWidth: 1,
      justifyContent: "center",
      marginRight: padding.sm - 2,
      marginTop: padding.sm - 2,
      padding: padding.sm - 2,
      minWidth: padding.md + 5
    },
    subInfoVariant: {
      borderBottomColor: colors.grey,
      marginHorizontal: "20%",
      padding: padding.sm - 2,
      marginTop: padding.md - 4
    },
    variantHeader: {
      backgroundColor: colors.white,
      borderBottomWidth: 0,
      color: colors.black,
      paddingTop: padding.md - 4
    },
    variantHeaderText: {
      color: colors.black,
      fontWeight: fonts.fontWeight.semibold,
      paddingLeft: padding.sm - 2
    },
    variantContainer: {
      padding: 0
    },
    basketButton: {
      paddingRight: padding.sm - 4
    },
    searchButton: {
      paddingRight: padding.sm - 4
    },
    quantityContainer: {
      paddingTop: padding.md - 4,
      paddingBottom: 0
    },
    quantityColumn: {
      width: "80%"
    }
  };
};

export const productInquiryDetailStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding, textAlign, spacing } = Theme.styles;

  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    ...colors,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    productDetail: {
      backgroundColor: colors.white,
      flex: 1
    },
    textInputError: {
      paddingTop: padding.sm + 4,
      height: padding.lg + 4,
      color: colors.bad
    },
    infoContainer: {
      marginBottom: padding.sm - 2
    },
    subInfoContainer: {
      ...miscellaneous.fill,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      padding: padding.md - 4
    },
    title: {
      color: fonts.color,
      fontSize: fonts.fontSize.fm,
      fontWeight: fonts.fontWeight.semibold
    },
    descriptionContainer: {
      paddingVertical: padding.md + 4
    },
    description: {
      color: fonts.color,
      fontSize: fonts.fontSize.md - 1,
      paddingTop: padding.sm - 2
    },
    itemAmount: {
      flex: 1,
      flexDirection: "row"
    },
    itemPriceTextOverridden: {
      ...textAlign.tar,
      paddingTop: padding.xs,
      textDecorationLine: "line-through"
    },
    itemSalePriceText: {
      ...textAlign.tar,
      paddingTop: padding.xs,
      paddingLeft: padding.xs,
      color: colors.itemDiscountsText
    },
    price: {
      color: fonts.color,
      fontSize: fonts.fontSize.fm,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: padding.sm - 2
    },
    priceOverridden: {
      textDecorationLine: "line-through",
      textDecorationStyle: "solid"
    },
    finalPrice: {
      color: colors.itemDiscountsText
    },
    priceContainer: {
      ...miscellaneous.fill,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      padding: padding.md - 4,
      flexDirection: "row"
    },
    subInfoVariant: {
      ...miscellaneous.fill,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      paddingHorizontal: padding.md - 4,
      paddingVertical: padding.sm - 2
    },
    variantStaticLabel: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.md - 1,
      width: 100
    },
    variantInfoLabel: {
      color: colors.black,
      fontSize: fonts.fontSize.md - 1
    },
    variantHeader: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xs - 1,
      padding: padding.md - 5,
      paddingBottom: padding.xs - 1
    },
    variantHeaderText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    variantContainer: {
      backgroundColor: colors.white,
      borderRadius: padding.sm - 2,
      padding: padding.md - 4,
      paddingTop: 0
    },
    subVariantContainer: {
      paddingTop: padding.md - 4
    },
    subInfoWithVariants: {
      flexDirection: "column"
    },
    subInfoWithoutVariants: {
      flexDirection: "row"
    },
    variantLabel: {
      color: colors.black,
      fontSize: fonts.fontSize.sm - 1
    },
    addButton: {
      ...buttons.btnPrimary,
      alignItems: "flex-start",
      justifyContent: "center"
    },
    addButtonText: {
      ...buttons.btnPrimaryText,
      fontSize: fonts.fontSize.fm,
      alignSelf: "flex-start"
    },
    buttonInner: {
      flexDirection: "row"
    },
    buttonText: {
      justifyContent: "center",
      marginLeft: padding.sm + 2
    },
    pickupButtonHeight: {
      height: 76
    },
    pickupIconSeparator: {
      height: 56
    },
    pickupStoreText: {
      marginTop: padding.xxs,
      color: colors.darkestGrey,
      fontSize: fonts.fontSize.sm,
      width: Theme.isTablet ? Dimensions.get('window').width / 3.5 : Dimensions.get('window').width / 2.1
    },
    buttonContainer: {
      marginLeft: spacing.xs,
      marginBottom: spacing.xs,
      marginRight: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      paddingLeft: spacing.sm,
      paddingRight: spacing.sm,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: colors.grey,
      backgroundColor: colors.lighterGrey,
      justifyContent: "center"
    },
    borderLine: {
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      marginTop: spacing.xs,
      marginBottom: spacing.xs
    },
    buttonContainerForfindNearby: {
      marginBottom: spacing.md,
      marginLeft: spacing.xs,
      marginTop: 0,
      marginRight: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      paddingLeft: spacing.sm,
      paddingRight: spacing.sm,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: colors.grey,
      backgroundColor: colors.lighterGrey,
      justifyContent: "center"
    },
    buttonSubContainer: {
      marginTop: spacing.xs,
      paddingVertical: spacing.xs,
      backgroundColor: colors.lighterGrey,
      justifyContent: "center"
    },
    buttonIconContainer: {
      justifyContent: "center",
      paddingHorizontal: padding.sm + 4,
      borderRightColor: Color(colors.white).alpha(0.38).toString(),
      borderRightWidth: 1,
      height: padding.md + 4,
      color: colors.white
    },
    availableText: {
      fontSize: fonts.fontSize.xs,
      marginTop: spacing.xxs
    },
    availableInventoryText: {
      fontSize: fonts.fontSize.xs,
      marginTop: spacing.xxs
    },
    checkingInventoryText: {
      fontSize: fonts.fontSize.xs,
      marginTop: spacing.xxs
    },
    unableAccessInventoryText: {
      fontSize: fonts.fontSize.xs,
      marginTop: spacing.xxs
    },
    availablePositive: {
      color: colors.good
    },
    availableNegative: {
      color: colors.bad
    },
    unavailableInventoryText: {
      color: Color(colors.black).alpha(0.6).toString()
    },
    secondaryButtonContainer: {
      marginTop: padding.sm - 2
    },
    shipmentButton: {
      ...buttons.btnPrimary,
      alignItems: "flex-start",
      backgroundColor: colors.white
    },
    shipmentButtonText: {
      ...buttons.btnSecondayText,
      fontSize: fonts.fontSize.fm,
      alignSelf: "flex-start"
    },
    shipmentButtonIconContainer: {
      borderRightColor: Color(colors.action).alpha(0.38).toString(),
      color: colors.action
    },
    disabledButton: {
      backgroundColor: colors.tagColor,
      borderWidth: 0
    },
    disabledButtonText: {
      color: colors.darkGrey
    },
    disabledButtonIconContainer: {
      borderRightColor: colors.darkGrey,
      color: colors.darkGrey
    },
    tabs: {
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      marginBottom: padding.md - 4
    },
    tab: {
      paddingVertical: padding.sm,
      paddingHorizontal: padding.lg,
      width: "33%"
    },
    tabActive: {
      color: colors.action,
      borderBottomColor: colors.action,
      borderBottomWidth: 2,
      borderBottomStyle: "solid"
    },
    tabText: {
      ...textAlign.tac
    },
    tabTextActive: {
      color: colors.action,
      fontSize: fonts.fontSize.fm - 2
    },
    headerIcon: {
      fill: colors.navigationText
    },
    basketButton: {
      display: "flex",
      flexDirection: "row",
      marginTop: -spacing.xs
    },
    itemCount: {
      backgroundColor: colors.bad,
      minWidth: padding.md,
      height: padding.md,
      borderRadius: 10,
      justifyContent: "center",
      marginLeft: -padding.sm + 2,
      marginTop: -padding.xs,
      paddingHorizontal: padding.sm - 4
    },
    itemCountText: {
      ...textAlign.tac,
      fontSize: fonts.fontSize.sm,
      color: colors.white
    },
    inputTextPanel: {
      height: padding.md
    },
    quantityContainer: {
      alignItems: "center",
      paddingVertical: padding.sm
    },
    quantityRow: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: padding.md,
      paddingRight: padding.sm,
      width: "100%"
    },
    quantityRowError: {
      borderBottomWidth: 2,
      borderBottomColor: colors.bad
    },
    quantityColumn: {
      flexDirection: "column",
      justifyContent: "center",
      width: "65%",
      alignSelf: "stretch",
      paddingBottom: padding.xs
    },
    quantityColumnFullWidth: {
      width: "100%",
      paddingHorizontal: padding.sm - 2
    },
    inputContainer: {
      ...miscellaneous.fill,
      borderWidth: 0,
      borderBottomWidth: 0,
      height: padding.md + 2,
      paddingLeft: padding.sm
    },
    input: {
      ...miscellaneous.fill,
      borderWidth: 0,
      borderBottomWidth: 0,
      height: padding.md + 2,
      paddingLeft: 0
    },
    textPromptPanel: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "center",
      paddingLeft: padding.sm
    },
    textPrompt: {
      fontSize: fonts.fontSize.xxs,
      justifyContent: "center"
    },
    loaderContainer: {
      height: 272,
      backgroundColor: colors.lighterGrey
    },
    availableButton: {
      marginTop: padding.xxs,
      flexDirection: "row"
    },
    activityIndicator: {
      size: "small",
      color: colors.black,
      marginRight: padding.xxs,
      marginTop: padding.sm - 2
    },
    searchButtonIcon: {
      height: 28
    }
  }, Theme.isTablet ? tabletProductInquiryDetailStyle() : phoneProductInquiryDetailStyle());
};

export const tabletCommentScreenListStyle = () => {
  const { miscellaneous, colors, forms, padding } = Theme.styles;
  return {
    freeTextContainer: {
      height: forms.input.height + padding.lg
    },
    root: {
      ...miscellaneous.screen,
      backgroundColor: colors.lightGrey
    }
  };
};

export const commentsScreen = () => {
  const { colors, fonts, miscellaneous, padding, buttons, forms, spacing } = Theme.styles;
  return Theme.merge({
    ...buttons,
    fill: {
      ...miscellaneous.fill
    },
    root: {
      ...miscellaneous.fill,
      flex: 1,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    button: {
      justifyContent: "center",
      marginTop: spacing.md,
      marginLeft: spacing.md,
      marginRight: spacing.md
    },
    freeTextContainer: {
      backgroundColor: colors.white,
      borderColor: colors.lightGrey,
      borderTopWidth: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 1,
      borderRightWidth: 0,
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      height: forms.input.height * 3,
      paddingTop: padding.sm,
      paddingLeft: padding.md,
      paddingRight: padding.md
    },
    freeTextInputField: {
      fontSize: fonts.fontSize.md,
      padding: padding.sm,
      width: "100%"
    },
    promptContainer: {
      paddingBottom: spacing.md,
      backgroundColor: colors.white
    }
  }, Theme.isTablet ? tabletCommentScreenListStyle() : {});
};
