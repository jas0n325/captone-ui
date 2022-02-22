import Theme from "../../styles";


export const modalStyle = () => {
  const { colors, fonts, padding } = Theme.styles;
  return {
    textPanel: {
      marginHorizontal: padding.md + 5,
      marginVertical: padding.md + 5
    },
    indicatorPanel: {
      marginBottom: padding.md + 5
    },
    modalTransparentContainer: {
      alignItems: "center",
      backgroundColor: colors.transparent,
      flex: 1,
      justifyContent: "center"
    },
    modalContainer: {
      alignItems: "center",
      backgroundColor: colors.overlay,
      flex: 1,
      justifyContent: "center"
    },
    modalView: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderRadius: padding.sm,
      minWidth: 200
    },
    separator : {
      alignSelf: "stretch",
      height: 1,
      backgroundColor: colors.action,
      marginVertical: padding.sm
    },
    closeButtonContainer : {
      alignSelf: "stretch",
      justifyContent: "flex-end",
      flexDirection: "row",
      margin: padding.sm + 2,
      marginTop: padding.xs - 3
    },
    closeButton : {
      alignItems: "center",
      alignSelf: "stretch",
      backgroundColor: colors.action,
      borderRadius: padding.xs + 1,
      justifyContent: "center",
      padding: padding.xs + 2,
      width : 120
    },
    closeButtonText: {
      color: colors.white,
      fontSize: fonts.fontSize.md
    },
    errorText: {
      fontSize: fonts.fontSize.md,
      textAlign: "center"
    },
    errorTitle: {
      fontSize: fonts.fontSize.md,
      textAlign: "center",
      fontWeight: "bold"
    },
    errorSubText: {
      fontSize: fonts.fontSize.sm,
      textAlign: "center"
    },
    errorDescription: {
      fontSize: fonts.fontSize.xs,
      textAlign: "center",
      color: colors.darkGrey
    },
    textPanelErrorDetails: {
      marginTop: padding.xs
    }
  };
};
