import { getBottomSpace } from "react-native-iphone-x-helper";
import Theme from "../../styles";

export const customerAddUpdateStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, spacing } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...forms,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    textInput: {
      alignSelf: "stretch"
    },
    controlsRow: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      flexDirection: "row",
      height: forms.input.height,
      justifyContent: "flex-start",
      paddingHorizontal: spacing.md,
      width: "100%"
    },
    inputText: {
      flex: 1,
      ...forms.input,
      ...forms.inputText,
      borderBottomWidth: 0,
      paddingLeft: spacing.xxs - 3
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
      paddingLeft: spacing.xxs - 3,
      paddingTop: spacing.sm - 2,
      justifyContent: "flex-start",
      width: "100%",
      color: colors.black,
      fontFamily: fonts.family,
      fontSize: fonts.fontSize.md,
      textAlign: "left"
    },
    sectionSubHeader: {
      justifyContent: "center",
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderTopColor: colors.grey,
      borderTopWidth: 1,
      padding: spacing.md,
      paddingTop: spacing.xs
    },
    sectionSubHeaderText: {
      color: colors.darkerGrey,
      fontSize: fonts.fontSize.nw,
      fontWeight: fonts.fontWeight.semibold
    },
    subtitleArea: {
      ...miscellaneous.banner,
      alignItems: "flex-start",
      backgroundColor: colors.lightGrey,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      justifyContent: "flex-end",
      padding: spacing.xs - 3,
      paddingLeft: spacing.md
    },
    subtitleText: {
      color: colors.darkGrey,
      textAlign: "center",
      fontSize: fonts.fontSize.sm - 1
    },
    textInputError: {
      paddingLeft: spacing.xs,
      paddingBottom: spacing.xs
    },
    textInputWarning: {
      color: colors.caution,
      paddingLeft: spacing.xs,
      paddingBottom: spacing.xs,
      fontSize: 14
    },
    addressDisplay: {
      alignItems: "flex-start",
      alignSelf: "stretch",
      flex: 1,
      fontSize: 17,
      justifyContent: "space-between",
      marginBottom: spacing.xxs
    },
    addressDisplayPadding: {
      padding: spacing.md
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
    }
  }, Theme.isTablet ? tabletOrderContactStyle() : {
    root: {
      paddingBottom: getBottomSpace()
    }
  });
};


export const tabletOrderContactStyle = () => {
  const { miscellaneous, padding } = Theme.styles;
  return {
    addressArea: {
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
