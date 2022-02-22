import Color from "color";

import Theme from "../../../styles";


export const customerDisplayStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return {
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      ...miscellaneous.screen,
      paddingTop: padding.md - 4
    },
    base: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      padding: padding.md - 4
    },
    assignCustomerHeaderPanel: {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "center",
      paddingTop: padding.sm - 2,
      paddingBottom: padding.md - 4
    },
    assignCustomerNameText: {
      color: colors.black,
      fontSize: fonts.fontSize.bt,
      textAlign: "center",
      paddingBottom: padding.xs - 1
    },
    assignCustomerIdText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.md,
      textAlign: "center",
      padding: padding.xs - 1
    },
    headerPanel: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "center",
      paddingTop: padding.sm - 2,
      paddingBottom: padding.md - 4,
      marginLeft: padding.md
    },
    customerNameArea: {
      flexDirection: "row",
      alignSelf: "stretch"
    },
    loyaltyIndicator: {
      alignItems: "flex-end",
      paddingRight: padding.sm
    },
    customerNameText: {
      color: colors.black,
      fontSize: fonts.fontSize.bt,
      textAlign: "left",
      paddingBottom: padding.xs - 1,
      flex: 3
    },
    customerIdText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.md,
      textAlign: "center"
    },
    customerTypeText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.md,
      textAlign: "center",
      padding: padding.xs - 1
    },
    activeTabStyle: {
      backgroundColor: colors.action
    },
    activeTabTextStyle: {
      color: colors.white
    },
    tabStyle: {
      borderColor: colors.action,
      marginTop: padding.md - 4
    },
    tabTextStyle: {
      color: colors.action
    },
    mainPanel: {
      ...miscellaneous.fill,
      justifyContent: "center"
    },
    detailsPiece: {
      alignItems: "flex-start",
      justifyContent: "flex-start",
      padding: padding.sm - 2
    },
    subtitleArea: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      justifyContent: "flex-start",
      paddingBottom: padding.xs - 1
    },
    subtitleText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.nw,
      fontWeight: fonts.fontWeight.semibold
    },
    sectionSubHeaderText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.nw
    },
    row: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start",
      margin: padding.sm - 2,
      marginBottom: 0,
      paddingTop: padding.sm - 2,
      paddingBottom: padding.md - 4
    },
    rowSeparator: {
      borderBottomWidth: 1,
      borderColor: colors.grey
    },
    iconPanel: {
      paddingRight: padding.md
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    detailsText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm,
      textAlign: "left"
    },
    preferences: {
      paddingVertical: padding.sm - 2
    },
    prefText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm,
      textAlign: "left"
    },
    assignBtnArea: {
      alignSelf: "stretch",
      paddingVertical: padding.sm - 2
    },
    btnArea: {
      ...miscellaneous.screenActions,
      alignSelf: "stretch",
      marginBottom: padding.sm
    },
    noLoyaltyText: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm,
      textAlign: "center"
    },
    customerButton: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm - 2
    },
    section: {
      borderTopWidth: 1,
      borderColor: colors.grey
    },
    sectionBody: {
      marginLeft: padding.md
    },
    sectionHeader: {
      justifyContent: "center",
      paddingTop: padding.sm,
      paddingBottom: padding.md
    },
    sectionSubHeader: {
      justifyContent: "center"
    },
    sectionRow: {
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start",
      marginBottom: 0,
      paddingBottom: padding.md
    },
    loyMembershipView: {
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      justifyContent: "center",
      paddingRight: padding.md
    },
    loyMembershipViewBody: {
      flex: 1
    },
    loyMembershipViewTitle: {
      color: colors.black,
      fontSize: fonts.fontSize.md,
      paddingBottom: padding.xs,
      textAlign: "left",
      fontWeight: "bold",
      marginRight: padding.xs
    },
    chevronIcon: {
      color: colors.action,
      height: fonts.fontSize.tl,
      width: fonts.fontSize.tl
    },
    attributesSection: {
      borderTopWidth: 8,
      borderColor: colors.grey
    },
    attributesSectionTitle: {
      color: colors.black,
      fontSize: fonts.fontSize.md,
      paddingTop: padding.md,
      textAlign: "left",
      fontWeight: "bold",
      marginRight: padding.xs,
      paddingLeft: padding.md
    },
    attributeDefinitionSectionFirst: {
      paddingTop: padding.md,
      paddingLeft: padding.md
    },
    attributeDefinitionSection: {
      borderTopWidth: 1,
      borderColor: colors.grey,
      paddingTop: padding.sm,
      paddingLeft: padding.md
    },
    attributeDataElementSection: {
      borderTopWidth: 1,
      borderColor: colors.grey
    },
    attributeDataElementRow: {
      paddingTop: padding.sm
    },
    attributeDefinitionSectionBody: {
    },
    attributeGroupTitleText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.nw,
      fontWeight: fonts.fontWeight.semibold
    },
    statusTags: {
      left: -padding.xs
    },
    controlArea: {
      alignSelf: "stretch",
      height: 50
    },
    transactionArea: {
      flex: 3,
      paddingTop: padding.sm
    },
    transactionMessageText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.md,
      textAlign: "center",
      paddingTop: padding.md
    }
  };
};

export const customerResultsStyles = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    assignCustAndSelectItemsBtn: {
      ...miscellaneous.banner,
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      alignItems: "center",
      padding: padding.sm
    },
    assignCustomerContainer: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    assignCustomerIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.bt
    },
    assignCustomerText: {
      alignSelf: "center",
      color: colors.action,
      fontSize: fonts.fontSize.md,
      marginLeft: padding.xs,
      textAlign: "left"
    },
    assignCustomerOpenIcon: {
      color: colors.chevron,
      fontSize: fonts.fontSize.md
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    arrowArea: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "stretch"
    },
    subtitleArea: {
      ...miscellaneous.banner,
      justifyContent: "flex-end",
      alignItems: "flex-start",
      paddingLeft: padding.sm,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1
    },
    titleText: {
      color: colors.black,
      textAlign: "center",
      fontSize: fonts.fontSize.md
    },
    subtitleText: {
      color: colors.darkGrey,
      textAlign: "center",
      fontSize: fonts.fontSize.sm
    },
    customerErrorArea: {
      ...miscellaneous.fill,
      justifyContent: "center",
      alignItems: "center"
    },
    emptyText: {
      color: colors.grey,
      textAlign: "center",
      fontSize: fonts.fontSize.xl
    },
    root: {
      ...miscellaneous.fill,
      paddingTop: padding.sm
    }
  });
};

export const customerSearchStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      flexDirection: "row",
      backgroundColor: colors.lightGrey
    },
    leftPanel: {
      ...miscellaneous.fill,
      justifyContent: "center",
      borderRightColor:  colors.grey,
      borderRightWidth: 1
    },
    rightPanel: {
      ...miscellaneous.actionPanel,
      backgroundColor: colors.white
    },
    textInput: {
      alignSelf: "stretch",
      marginHorizontal: padding.md - 4
    },
    formArea: {
      flex: 1,
      paddingTop: padding.md - 4
    },
    btnArea: {
      justifyContent: "flex-start",
      marginBottom: padding.md,
      padding: padding.md - 4
    },
    customerButton: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm - 2
    },
    textInputError: {
      paddingLeft: padding.xs,
      paddingBottom: padding.xs
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    arrowArea: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "stretch"
    },
    cameraIconPanel: {
      backgroundColor: colors.white,
      borderColor: colors.grey,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomWidth: 1,
      height: forms.input.height,
      width: 50
    },
    cameraIcon: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.bt
    }
  });
};

export const customerResultLineStyles = () => {
  const { colors, fonts, miscellaneous, padding, textAlign } = Theme.styles;
  return {
    ...miscellaneous,
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
      marginVertical: padding.xs - 2,
      padding: padding.sm - 2,
      paddingTop: padding.xs - 1,
      paddingRight: padding.md - 4
    },
    activeRow: {
      backgroundColor: Color(colors.action).alpha(0.05).toString()
    },
    customerDetails: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flex: 1,
      flexDirection: "row",
      paddingTop: padding.xs - 1
    },
    customerNameLoyaltyContainer: {
      textAlign: "left",
      width: "100%",
      justifyContent: "space-between",
      flex: 2,
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      paddingBottom: padding.xxs - 2,
      marginBottom: padding.xxs - 2
    },
    customerNameText: {
      color: colors.action,
      flex: 1,
      fontSize: fonts.fontSize.md - 1,
      textAlign: "left"
    },
    loyaltyCardIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.md + 2
    },
    customerText: {
      color: colors.darkerGrey,
      flex: 1,
      fontSize: fonts.fontSize.sm - 1,
      textAlign: "left"
    },
    selected: {
      color: colors.action,
      fontSize: fonts.fontSize.tl
    }
  };
};
