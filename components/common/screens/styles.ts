import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../../styles";

export const tabletCommentScreenListStyle = () => {
  const { miscellaneous, colors, forms, padding } = Theme.styles;
  return {
    fill: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    freeTextContainer: {
      height: forms.input.height + padding.lg
    }
  };
};

export const commentsScreen = () => {
  const { colors, fonts, miscellaneous, padding, buttons, forms, spacing } = Theme.styles;
  return Theme.merge({
    ...buttons,
    fill: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      flex: 1
    },
    optionButton: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.lightGrey,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      padding: padding.sm,
      width: "100%"
    },
    optionText: {
      fontSize: fonts.fontSize.fm,
      color: fonts.color,
      paddingVertical: spacing.xxs
    },
    languageView: {
      flexDirection: "column"
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
    freeTextCommentButton: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderColor: colors.lightGrey,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      padding: padding.sm,
      marginTop: spacing.xs,
      width: "100%"
    },
    freeTextCommentText: {
        fontSize: fonts.fontSize.fm,
        color: colors.darkGrey
    },
    checkIcon: {
      color: colors.action,
      fontSize: fonts.fontSize.fm
    },
    button: {
      justifyContent: "center",
      marginBottom: spacing.xs,
      marginTop: spacing.xs
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
      height: forms.input.height * 3
    },
    freeTextInputField: {
      fontSize: fonts.fontSize.md,
      padding: padding.sm,
      width: "100%"
    }
  }, Theme.isTablet ? tabletCommentScreenListStyle() : {
    root: {
      paddingBottom: getBottomSpace()
    }
  });
};
