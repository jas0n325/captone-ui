import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../styles";

export const tabletCustomerStyle = () => {
  const { miscellaneous, padding } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    },
    subtitleArea: {
      height: miscellaneous.banner.height * 0.7
    },
    btnArea: {
      ...miscellaneous.screenActions,
      paddingVertical: padding.lg + 2
    }
  };
};

export const customerDisplayScreenStyle = () => {
  const { miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.fill
    }
  };
};

export const customerAddUpdateStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, spacing } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...forms,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      justifyContent: "flex-start"
    },
    textInput: {
      alignSelf: "stretch"
    },
    attributeTextInput: {
      alignSelf: "flex-start",
      width: "85%",
      marginLeft: padding.xs + 2,
      paddingBottom: padding.xxs - 3,
      marginTop: 0
    },
    attributeTextInputError: {
      paddingLeft: padding.xxs
    },
    attributeTextValue: {
      paddingLeft: padding.xxs
    },
    attributeChoice: {
      alignSelf: "flex-start",
      width: "85%",
      marginLeft: padding.xs + 2,
      paddingHorizontal: 0,
      paddingBottom: 0
    },
    attributeChoiceInput: {
      alignSelf: "flex-start",
      paddingHorizontal: 0,
      paddingBottom: 0,
      paddingLeft: padding.xxs
    },
    attributesContainer: {
      backgroundColor: colors.white
    },
    attributeLastElement: {
      marginBottom: padding.sm - 3
    },
    attributePersistPlaceHolder: {
      marginLeft: padding.xxs,
      paddingLeft: 0
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
      paddingLeft: padding.xxs - 3
    },
    placeholderLabelText: {
      color: colors.placeholderTextColor,
      fontSize: fonts.fontSize.xxs,
      textAlign: "left"
    },
    switchPanel: {
      paddingLeft: padding.xxs,
      width: "85%",
      marginLeft: padding.xs + 2
    },
    container: {
      flex: 1,
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 0,
      flexDirection: "column",
      paddingLeft: padding.xxs - 3,
      paddingTop: padding.sm,
      justifyContent: "flex-start",
      width: "100%",
      color: colors.black,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.md,
      textAlign: "left"
    },
    optInOptions: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      paddingBottom: padding.sm + 2
    },
    toggle: {
      paddingLeft: padding
    },
    attributeSwitchContainer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "85%",
      marginLeft: padding.sm - 1,
      ...forms.input
    },
    attributeSwitchText: {
      paddingLeft: padding.xxs - 3
    },
    attributeSwitch: {
      justifyContent: "flex-end"
    },
    optInRow: {
      alignItems: "center",
      backgroundColor: colors.white,
      flexDirection: "column",
      height: forms.input.height * 1.45,
      justifyContent: "center",
      padding: padding.xs,
      paddingHorizontal: padding.md - 4
    },
    optInArea: {
      alignItems: "stretch",
      flex: 1,
      paddingTop: padding.xs
    },
    textPrompt: {
      alignSelf: "flex-start",
      fontSize: fonts.fontSize.fm,
      paddingTop: padding.xs
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
    subtitleArea: {
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      paddingRight: padding.xs,
      paddingLeft: padding.md - 4
    },
    subtitleText: {
      color: colors.darkGrey,
      textAlign: "center",
      fontSize: fonts.fontSize.sm - 1,
      paddingBottom: padding.sm,
      paddingTop: padding.sm
    },
    longDescriptionArea: {
      alignItems: "flex-start",
      justifyContent: "flex-end",
      paddingBottom: padding.xs,
      paddingLeft: padding.md - padding.xxs,
      paddingRight: padding.sm,
      paddingTop: padding.sm
    },
    longDescriptionText: {
      color: colors.darkerGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.sm + 1,
      fontWeight: fonts.fontWeight.regular
    },
    longDescriptionTextLink: {
      color: colors.action,
      textAlign: "left",
      fontSize: fonts.fontSize.sm + 1,
      fontWeight: fonts.fontWeight.regular,
      paddingTop: padding.xs,
      paddingBottom: padding.xs
    },
    attributeDataElementSection: {
      borderRadius: 5,
      borderColor: colors.grey,
      borderWidth: 1,
      marginLeft: padding.xs + 1,
      marginBottom: padding.xs + 1,
      marginRight: padding.xs + 1
    },
    attributeDataElementSectionTop: {
      marginTop: padding.xs + 1
    },
    attributeTitle: {
      backgroundColor: colors.white,
      marginTop: padding.lg,
      marginBottom: padding.xs,
      marginLeft: Theme.isTablet ? 0 : padding.sm,
      alignItems: "flex-start",
      justifyContent: "flex-end",
      fontWeight: fonts.fontWeight.semibold,
      fontSize: fonts.fontSize.bt
    },
    attributeDeleteButton: {
      top: 0,
      right: 0,
      position: "absolute",
      width: "10%",
      padding: spacing.md - 2,
      paddingLeft: padding.md
    },
    attributeDeleteIcon: {
      backgroundColor: colors.darkerGrey,
      borderColor: colors.darkerGrey,
      borderRadius: 50,
      borderWidth: 1,
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.tl,
      position: "absolute",
      top: padding.sm + padding.xxs,
      right: padding.sm + padding.xxs
    },
    row: {
      flexDirection: "row"
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
    textInputWarning: {
      color: colors.caution,
      paddingLeft: padding.xs,
      paddingBottom: padding.xs,
      fontSize: 14
    },
    addressSuggestionText: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.lightGrey,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: padding.sm + 2,
      paddingRight: padding.sm + 6,
      paddingLeft: padding.sm + 6,
      paddingTop: padding.sm + 2,
      width: "100%",
      margin: .5
    },
    actionInputBox: {
      borderWidth: 1,
      paddingBottom: padding.sm + 2,
      paddingRight: padding.sm + 6,
      paddingLeft: padding.sm + 6,
      paddingTop: padding.sm + 2,
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.lightGrey,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%"
    },
    phoneNumberRow: {
      flex: 1,
      flexDirection: "row"
    },
    phoneNumberCode: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: colors.lightGrey
    },
    phoneNumber: {
      flex: 5
    },
    helpText: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs,
      marginLeft: padding.sm + 1,
      paddingLeft: padding.xs,
      width: "85%"
    },
    dateFormat: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs,
      marginLeft: padding.sm + 1,
      paddingLeft: padding.xs,
      width: "85%"
    },
    dateInputError: {
      color: colors.bad,
      fontSize: fonts.fontSize.xs,
      marginLeft: padding.sm + padding.xxs - 1,
      marginBottom: padding.xxs
    },
    cautionPanel: {
      margin: padding.sm
    },
    disabled: {
      backgroundColor: colors.lighterGrey,
      color: colors.darkGrey
    }
  }, Theme.isTablet ? tabletCustomerStyle() : {
    root: {
      paddingBottom: getBottomSpace()
    },
    addAttributeAndSelectItemsBtn: {
      ...miscellaneous.banner,
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      alignItems: "center",
      padding: padding.sm
    },
    addAttributeContainer: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    addAttributeIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.bt
    },
    addAttributeText: {
      alignSelf: "center",
      color: colors.action,
      fontSize: fonts.fontSize.md,
      marginLeft: padding.xs,
      textAlign: "left"
    },
    menuIcon: {
      color: colors.navigationText,
      fontSize: fonts.fontSize.lg,
      paddingTop: padding.xs
    }
  });
};

export const customerAttributeEditorStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...forms,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      justifyContent: "flex-start",
      paddingVertical: padding.sm

    },
    textInput: {
      alignSelf: "stretch"
    },
    attributeTextInput: {
      alignSelf: "flex-start",
      paddingLeft: padding.xxs,
      marginTop: 0,
      width: "100%"
    },
    attributeEmptyInput: {
      ...forms.input
    },
    attributeChoice: {
      alignSelf: "flex-start",
      paddingHorizontal: 0,
      paddingBottom: 0
    },
    attributeChoiceInput: {
      alignSelf: "flex-start",
      paddingLeft: padding.md,
      paddingHorizontal: 0,
      paddingBottom: 0,
      color: colors.darkerGrey
    },
    attributesContainer: {
      backgroundColor: colors.white
    },
    attributeLastElement: {
      marginBottom: padding.sm - 3
    },
    attributePlaceholderLabelText: {
      marginLeft: padding.sm - 1,
      paddingLeft: padding.md
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
      paddingLeft: padding.xxs - 3
    },
    placeholderLabelText: {
      color: colors.placeholderTextColor,
      fontSize: fonts.fontSize.xxs,
      textAlign: "left"
    },
    container: {
      flex: 1,
      alignSelf: "stretch",
      backgroundColor: colors.white,
      borderWidth: 0,
      flexDirection: "column",
      paddingLeft: padding.xxs - 3,
      paddingTop: padding.sm,
      justifyContent: "flex-start",
      width: "100%",
      color: colors.black,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.md,
      textAlign: "left"
    },
    toggle: {
      paddingLeft: padding
    },
    attributeSwitchContainer: {
      alignItems: "center",
      flexDirection: "row",
      paddingLeft: padding.md,
      justifyContent: "space-between",
      marginLeft: padding.sm - 1,
      width: "99%",
      ...forms.input
    },
    attributeSwitchText: {
      paddingLeft: padding.xxs - 3
    },
    attributeSwitch: {
      justifyContent: "flex-end"
    },
    textPrompt: {
      alignSelf: "flex-start",
      fontSize: fonts.fontSize.fm,
      paddingTop: padding.xs
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
    subtitleArea: {
      alignItems: "flex-start",
      paddingBottom: padding.xxs - 3,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1
    },
    subtitleText: {
      alignSelf: "flex-start",
      marginLeft: padding.md,
      paddingBottom: padding.sm - 2,
      marginTop: 0
    },
    attributeDataElementSection: {
      borderRadius: 5,
      borderColor: colors.grey,
      borderWidth: 1,
      marginLeft: padding.xs + 1,
      marginBottom: padding.xs + 1,
      marginRight: padding.xs + 1
    },
    attributeDataElementSectionTop: {
      marginTop: padding.xs + 1
    },
    attributeTitle: {
      alignSelf: "flex-start",
      marginLeft: padding.md,
      marginTop: 0,
      fontSize: fonts.fontSize.xxs,
      color: colors.darkerGrey
    },
    switchPanel: {
      paddingLeft: padding.md,
      width: "100%"
    },
    dateFormat: {
      color: colors.darkGrey,
      fontSize: fonts.fontSize.xs,
      marginLeft: padding.md,
      marginBottom: padding.xs + 1
    },
    dateInputError: {
      color: colors.bad,
      fontSize: fonts.fontSize.xs,
      marginLeft: padding.md,
      marginBottom: padding.xxs
    }
  }, Theme.isTablet ? tabletCustomerStyle() : {
    root: {
      paddingBottom: getBottomSpace()
    },
    addAttributeAndSelectItemsBtn: {
      ...miscellaneous.banner,
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      alignItems: "center",
      padding: padding.sm
    },
    addAttributeContainer: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    addAttributeIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.bt
    },
    addAttributeText: {
      alignSelf: "center",
      color: colors.action,
      fontSize: fonts.fontSize.md,
      marginLeft: padding.xs,
      textAlign: "left"
    }
  });
};

export const textScreenStyle = () => {
  const { colors, fonts, miscellaneous, padding } = Theme.styles;
  return {
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      ...miscellaneous.screen
    },
    base: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    displayTextArea: {
      padding: padding.md
    },
    displayText: {
      color: colors.darkerGrey,
      textAlign: "left",
      fontSize: fonts.fontSize.sm - 1
    }
  };
};

const tabletAddressSearch = () => {
  const { miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    }
  };
};

export const addressSearch = () => {
  const { colors, miscellaneous, padding, fonts, forms } = Theme.styles;
  return Theme.merge({
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      justifyContent: "flex-start"
    },
    inputField: {
      backgroundColor: colors.white,
      borderColor: colors.lightGrey,
      borderTopWidth: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 1,
      borderRightWidth: 0,
      fontSize: fonts.fontSize.md,
      height: forms.input.height,
      padding: padding.sm
    },
    addressSuggestionWrapper: {
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGrey
    },
    addressSuggestionText: {
      alignItems: "center",
      backgroundColor: colors.white,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: padding.sm,
      paddingRight: padding.md,
      paddingLeft: padding.md,
      paddingTop: padding.sm,
      width: "100%",
      margin: .5
    }
  }, Theme.isTablet ? tabletAddressSearch() : {
    root: {
      paddingBottom: getBottomSpace()
    }
  });
};
export const baseViewFill = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};

export const phoneCountryCodeStyle = () => {
  const { miscellaneous, colors, fonts, forms, padding } = Theme.styles;
  return Theme.merge({
    root: {
      ...miscellaneous.fill
    },
    inputField: {
      backgroundColor: colors.white,
      borderColor: colors.lightGrey,
      borderTopWidth: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 1,
      borderRightWidth: 0,
      fontSize: fonts.fontSize.md,
      height: forms.input.height,
      padding: padding.sm
    },
    listView: {
      flex: 1,
      flexDirection: "row",
      padding: padding.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGrey,
      justifyContent: "space-between"
    },
    icon: {
      fontSize: fonts.fontSize.tl,
      color: colors.action
    },
    iconView: {
      justifyContent: "center",
      alignItems: "center"
    },
    textView: {
      marginLeft: padding.sm
    }
  }, Theme.isTablet ? { ...miscellaneous.screen } : { root: {} });
};

export const AttributeGroupDefinitionCodeStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...forms,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      justifyContent: "flex-start"

    },
    searchContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      backgroundColor: colors.white,
      borderColor: colors.grey,
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: padding.md - 1,
      paddingRight: padding.sm
    },
    inputField: {
      width: "85%",
      fontSize: fonts.fontSize.md,
      height: forms.input.height
    },
    listView: {
      flex: 1,
      flexDirection: "row",
      padding: padding.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      justifyContent: "space-between"
    },
    placeHolderText: {
      color: colors.darkerGrey
    },
    searchIcon: {
      color: colors.darkerGrey,
      size: fonts.fontSize.bt
    },
    icon: {
      fontSize: fonts.fontSize.tl,
      color: colors.action
    },
    iconView: {
      justifyContent: "center",
      alignItems: "center"
    },
    textView: {
      marginLeft: padding.sm
    }
  }, Theme.isTablet ? tabletCustomerStyle() : {
    root: {
      paddingBottom: getBottomSpace()
    },
    addAttributeAndSelectItemsBtn: {
      ...miscellaneous.banner,
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      alignItems: "center",
      padding: padding.sm
    },
    addAttributeContainer: {
      alignItems: "center",
      alignSelf: "stretch",
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    addAttributeIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.bt
    },
    addAttributeText: {
      alignSelf: "center",
      color: colors.action,
      fontSize: fonts.fontSize.md,
      marginLeft: padding.xs,
      textAlign: "left"
    }
  });
};

export const tabletcustomerNipStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    }
  };
};

export const customerNipStyles = () => {
  const { buttons, colors, miscellaneous, padding } = Theme.styles;
  return Theme.merge(
    {
      ...buttons,
      root: {
        ...miscellaneous.fill,
        backgroundColor: colors.lightGrey
      },
      input: {
        width: "100%"
      },
      inputField: {
        paddingLeft: padding.md
      }
    },
    Theme.isTablet && tabletcustomerNipStyles()
  );
};
