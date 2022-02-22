import Theme from "../../styles";

export const donationStyle = (screenWidth: number) => {
  const { buttons, colors, fonts, miscellaneous, spacing } = Theme.styles;
  return {
    ...miscellaneous,
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      flexDirection: Theme.isTablet ? "row" : "column"
    },
    container: {
      alignSelf: "stretch",
      backgroundColor: colors.white,
      justifyContent: "flex-start"
    },
    imageArea: {
      alignItems: "center",
      alignSelf: "stretch",
      height: Theme.isTablet ? "100%" : (screenWidth * 0.75 / 2),
      justifyContent: "center",
      padding: spacing.md
    },
    imageSize: {
      height: Theme.isTablet ? (screenWidth - 350) : ((screenWidth * 0.75 / 2) - spacing.md * 2),
      width: Theme.isTablet ? (screenWidth - 375) : (screenWidth - spacing.md * 2)
    },
    textInput: {
      alignSelf: "stretch",
      paddingLeft: 0,
      marginHorizontal: Theme.isTablet ? spacing.md : 0
    },
    textInputError: {
      marginLeft: spacing.md
    },
    donateButtons: {
      margin: spacing.sm
    },
    amountButtons: {
      alignSelf: "stretch"
    },
    amountbuttonsRow: {
      flexDirection: "row",
      justifyContent: "space-between"
    },
    button: {
      alignSelf: "stretch",
      justifyContent: "center",
      margin: spacing.xxs,
      padding: spacing.sm
    },
    amountButton: {
      alignSelf: "stretch",
      flex: 1,
      justifyContent: "center",
      margin: spacing.xxs,
      padding: spacing.sm
    },
    roundUpButton: {
      height: "auto"
    },
    amountText: {
      color: colors.darkestGrey,
      fontSize: fonts.fontSize.nw,
      marginTop: spacing.xxs
    },
    leftPanel: {
      ...miscellaneous.fill,
      backgroundColor: colors.white,
      borderRightColor:  colors.grey,
      borderRightWidth: 1,
      justifyContent: "center"
    },
    rightPanel: {
      ...miscellaneous.actionPanel,
      backgroundColor: colors.white,
      paddingTop: spacing.xs
    }
  };
};

export const donationScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
