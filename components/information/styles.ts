import Theme from "../../styles";


export const tabletInformationStyle = () => {
  const { miscellaneous, padding } = Theme.styles;
  return ({
    informationContainer: {
      ...miscellaneous.screen,
      justifyContent: "space-between",
      paddingTop: padding.md - 4
    },
    informationLine: {
      alignItems : "flex-start",
      flexDirection : "row",
      justifyContent : "center",
      margin: padding.sm
    },
    informationTitle: {
      flex : 1,
      textAlign: "left",
      justifyContent: "flex-start"
    },
    informationText: {
      flex : 1
    },
    btnArea: {
      ...miscellaneous.screenActions
    }
  });
};

export const informationStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding, textAlign } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...miscellaneous,
    informationContainer: {
      alignItems: "center",
      backgroundColor: colors.white,
      flex: 1
    },
    scrollViewContainer: {
      margin: padding.md - 4,
      paddingHorizontal: padding.md,
      width: "100%"
    },
    activeTabStyle: {
      backgroundColor: colors.action
    },
    activeTabTextStyle: {
      color: colors.white
    },
    tabStyle: {
      borderColor: colors.action,
      height: forms.input.height * 0.7
    },
    tabTextStyle: {
      color: colors.action,
      fontSize: fonts.fontSize.xs + 1
    },
    informationSection: {
      marginTop: padding.sm
    },
    informationLine: {
      ...miscellaneous.panel,
      marginVertical: padding.xs - 1
    },
    informationSecondaryLine: {
      ...miscellaneous.panel
    },
    informationTitle: {
      alignSelf: "stretch",
      fontSize: fonts.fontSize.md,
      fontWeight: "bold",
      marginBottom: padding.xs - 3
    },
    informationText: {
      ...textAlign.tal,
      alignSelf: "stretch",
      fontSize: fonts.fontSize.md
    },
    informationDisclaimer: {
      fontSize: fonts.fontSize.xxs
    },
    flatList: {
      alignSelf: "stretch",
      paddingHorizontal: padding.sm
    },
    btnArea: {
      ...miscellaneous.panel
    },
    button: {
      justifyContent: "center",
      marginTop: padding.md - 4
    }
  }, Theme.isTablet ? tabletInformationStyle() : {});
};
