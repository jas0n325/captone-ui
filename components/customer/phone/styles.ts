import Color = require("color");
import Theme from "../../../styles";


export const customerDisplayStyle = () => {
  const { buttons, colors, fonts, miscellaneous, padding, spacing } = Theme.styles;
  return {
    ...buttons,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    headerPanel: {
      justifyContent: "space-around",
      alignItems: "flex-start",
      alignSelf: "stretch",
      backgroundColor: colors.white,
      paddingTop: padding.xs - 4,
      paddingLeft: padding.md - 4,
      paddingRight: padding.sm,
      paddingBottom: padding.sm,
      marginLeft: padding.xs
    },
    customerNameArea: {
      flexDirection: "row",
      alignSelf: "stretch"
    },
    loyaltyIndicator: {
      alignItems: "flex-end"
    },
    customerNameText: {
      color: colors.black,
      textAlign: "left",
      fontSize: fonts.fontSize.fm,
      fontWeight: fonts.fontWeight.semibold,
      flex: 3
    },
    customerIdText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.md,
      textAlign: "center",
      marginTop: padding.xs
    },
    activeTabStyle: {
      backgroundColor: colors.action
    },
    activeTabTextStyle: {
      color: colors.white
    },
    tabStyle: {
      borderColor: colors.action,
      marginTop: padding.xs
    },
    tabTextStyle: {
      color: colors.action
    },
    mainPanel: {
      alignSelf: "stretch",
      backgroundColor: colors.white
    },
    row: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start",
      marginHorizontal: padding.md - 4,
      paddingVertical: padding.md - 4
    },
    rowSeparator: {
      borderColor: colors.grey,
      borderBottomWidth: 1
    },
    address: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flex: 1,
      justifyContent: "space-between"
    },
    subtitleArea: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      padding: padding.md - 4,
      paddingBottom: padding.xs - 1
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    iconPanel: {
      alignItems: "center",
      justifyContent: "flex-start",
      paddingRight: padding.sm
    },
    detailsPiece: {
      justifyContent: "space-around",
      alignItems: "flex-start",
      backgroundColor: colors.white,
      marginHorizontal: padding.md - 4,
      paddingVertical: padding.md - 4
    },
    subtitleText: {
      color: colors.darkerGrey,
      textAlign: "center",
      fontSize: fonts.fontSize.nw,
      fontWeight: fonts.fontWeight.semibold
    },
    sectionSubHeaderText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.nw
    },
    preferenceSeparator: {
      borderColor: colors.grey,
      borderTopWidth: 1
    },
    prefText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm,
      textAlign: "left"
    },
    detailsText: {
      color: colors.black,
      fontSize: fonts.fontSize.fm,
      textAlign: "left"
    },
    btnArea: {
      alignSelf: "stretch",
      padding: padding.sm,
      marginBottom: padding.sm
    },
    customerButton: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm
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
      alignItems: "flex-start",
      paddingTop: padding.sm,
      paddingBottom: spacing.sm
    },
    sectionSubHeader: {
      justifyContent: "center",
      alignItems: "flex-start"
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
      paddingRight: padding.sm

    },
    loyMembershipViewBody: {
      flex: 1
    },
    loyMembershipViewTitle: {
      color: colors.black,
      fontSize: fonts.fontSize.md,
      paddingBottom: padding.xs,
      textAlign: "left",
      fontWeight: fonts.fontWeight.semibold
    },
    chevronIcon: {
      color: colors.action,
      height: padding.sm + 6.7,
      width: padding.sm - 1.6
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
    attributeGroupTitleText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.nw,
      fontWeight: fonts.fontWeight.semibold
    },
    statusTags: {
      left: -padding.xs
    },
    controlArea: {
      padding: padding.sm,
      alignSelf: "stretch",
      height: 60
    },
    transactionArea: {
      borderTopWidth: 1,
      borderColor: colors.grey,
      backgroundColor: colors.lightGrey,
      flex: 3,
      paddingTop: padding.sm
    },
    transactionMessageText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.md,
      textAlign: "center",
      paddingTop: padding.md
    },
    titleText: {
      color: colors.black,
      textAlign: "center",
      fontSize: fonts.fontSize.md,
      fontWeight: fonts.fontWeight.bold
    },
    hoursOfOperationTextStyle: {
      alignItems: "flex-start",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: padding.xxs,
      paddingHorizontal: padding.xs
    },
    hoursOfOperationTextColor: {
      alignItems: "flex-start",
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: Color(colors.orange).alpha(0.08).string(),
      paddingTop: padding.xxs,
      paddingBottom: padding.xxs,
      paddingHorizontal: padding.xs
    },
    hoursOfOperationFontStyle: {
      fontSize: fonts.fontSize.sm,
      textAlign: "left",
      flex: 1
    },
    hoursOfOperationstyle: {
      fontSize: fonts.fontSize.sm,
      paddingRight: padding.xs,
      textAlign: "center",
      flex: 1
    },
    hoursOfOperationHeader: {
      justifyContent: "center",
      alignItems: "flex-start",
      paddingBottom: padding.sm
    },
    hoursOfOperationContainer: {
      paddingRight: padding.md
    },
    buttonContainer: {
      marginBottom: spacing.xxs,
      paddingVertical: spacing.xs,
      marginRight: spacing.md,
      justifyContent: "center"
    },
    buttonIconContainer: {
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      borderRightColor: colors.white,
      borderRightWidth: 1,
      height: spacing.lg
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
      marginLeft: spacing.sm
    },
    iconColor:{
      color: colors.white
    },
    iconHeight:{
      height:fonts.fontSize.bt
    },
    buttonContainerRowTab: {
      justifyContent:"flex-end",
      alignSelf: "flex-end",
      padding:spacing.md
    },
    buttonTab: {
      ...buttons.btnPrimary,
      paddingHorizontal:spacing.xxs
    },
    buttonIconContainerTab: {
      paddingHorizontal: spacing.xs,
      paddingRight:spacing.md,
      alignItems: "flex-start",
      borderRightColor: colors.white,
      borderRightWidth: 1,
      height: spacing.lg,
      color: colors.white
    },
    addButtonTextTab: {
      ...buttons.btnPrimaryText,
      fontSize: fonts.fontSize.fm,
      alignSelf: "flex-start",
      marginLeft: spacing.md
    },
    buttonTextTab: {
      justifyContent: "center",
      marginRight: spacing.md
    },
    disabledButton: {
      backgroundColor: colors.tagColor,
      borderWidth: 0
    },
    disabledButtonIconContainer: {
      borderRightColor: colors.darkGrey,
      color: colors.darkGrey
    },
    disabledButtonText: {
      color: colors.darkGrey
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
    titleText: {
      color: colors.black,
      textAlign: "center",
      fontSize: fonts.fontSize.md
    },
    subtitleArea: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.borderColor,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      marginBottom: padding.xs - 1,
      padding: padding.md - 5,
      paddingBottom: padding.xs - 1
    },
    subtitleText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.sm - 1
    },
    customerErrorArea: {
      alignItems: "center",
      backgroundColor: colors.white,
      justifyContent: "space-around",
      marginTop: padding.md - 4,
      padding: padding.lg
    },
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    }
  });
};

export const customerSearchStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    assignCustAndSelectItemsBtn: {
      ...miscellaneous.banner,
      alignItems: "center",
      alignSelf: "stretch",
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: padding.md - 4,
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
    textInput: {
      alignSelf: "stretch"
    },
    formArea: {
      flex: 1,
      paddingTop: padding.sm
    },
    btnArea: {
      justifyContent: "flex-end",
      margin: padding.sm,
      padding: padding.sm
    },
    customerButton: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: padding.sm
    },
    textInputError: {
      paddingLeft: padding.xs,
      paddingBottom: padding.xs
    },
    btnDisabled: {
      backgroundColor: colors.grey,
      borderColor: colors.grey
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
    },
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    }
  });
};

export const customerResultLineStyles = () => {
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
      justifyContent: "center",
      marginHorizontal: padding.sm - 2,
      marginVertical: padding.xs - 2,
      padding: padding.sm - 2
    },
    activeRow: {
      backgroundColor: colors.accent
    },
    customerDetails: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flex: 1
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
      fontWeight: fonts.fontWeight.semibold,
      fontSize: fonts.fontSize.md - 1,
      textAlign: "left"
    },
    loyaltyCardIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.md + 2
    },
    customerText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.sm - 1,
      textAlign: "left"
    }
  };
};
