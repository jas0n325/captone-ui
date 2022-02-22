import Theme from "../../styles";

export const tabletUnavailableQuantitiesDetailStyle = () => {
  const { buttons, miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.fill,
      flexDirection: "column"
    },
    mainContent:{
      justifyContent: "center",
      flexDirection: "row"
    },
    unreservedDetail: {
      flexDirection: "column"
    },
    unreservedDetailContainer: {
      maxWidth: 560
    },
    btnSecondayText: {
      ...buttons.btnSecondayText,
      paddingTop: 0
    },
    closeButton: {
      ...buttons.btnSeconday,
      paddingTop: 0
    },
    itemRow: {
      flex: 1
    }
  };
};

export const unavailableQuantitiesDetailStyle = () => {
  const { buttons, colors, fonts, miscellaneous, textAlign, spacing } = Theme.styles;
  return Theme.merge(
      {
        ...buttons,
        root: {
          ...miscellaneous.fill,
          backgroundColor: colors.white
        },
        unreservedDetail: {
          backgroundColor: colors.white,
          flexDirection: "column"
        },
        feedbackNote:{
          paddingHorizontal: spacing.xs,
          justifyContent: "center"
        },
        headerText:{
          color: colors.black,
          fontWeight: fonts.fontWeight.semibold,
          fontSize: fonts.fontSize.fm,
          paddingHorizontal: spacing.xs,
          marginTop: spacing.lg,
          marginBottom: spacing.xs
        },
        buttonContainer: {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.xs,
          backgroundColor: colors.white,
          justifyContent: "center"
        },
        closeButton: {
          ...buttons.btnSeconday,
          width: "100%"
        },
        btnSecondayText: {
          ...buttons.btnSecondayText,
          paddingTop: 0
        },
        descriptionTitle: {
          ...textAlign.tal,
          flex: 1,
          fontSize: fonts.fontSize.fm,
          color: fonts.color
        },
        descriptionText : {
          ...textAlign.tar,
          flex: 2,
          fontSize: fonts.fontSize.fm,
          color: fonts.color
        }
      },
      Theme.isTablet
          ? tabletUnavailableQuantitiesDetailStyle()
          : { }
  );
};
