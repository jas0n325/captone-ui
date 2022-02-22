import Theme from "../../../styles";


export const baseViewFill = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};

export const tabletTenderExchangeInScreenStyles = () => {
  const { miscellaneous, padding } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    },
    buttonContainer: {
      ...miscellaneous.screenActions,
      paddingVertical: padding.lg + 2
    }
  };
};

export const tenderExchangeInScreenStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding, textAlign } = Theme.styles;
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
      },
      buttonContainer: {
        ...miscellaneous.fill,
        padding: padding.md
      },
      mainButton: {
        ...buttons.btnPrimary,
        marginBottom: padding.sm
      },
      closeButton: {
        ...buttons.btnSeconday,
        marginBottom: padding.sm
      },
      closeButtonDetailed: {
        ...buttons.btnPrimaryDetailed,
        marginBottom: padding.sm,
        backgroundColor: colors.white,
        marginTop: padding.sm
      },
      resultsArea: {
        backgroundColor: colors.white,
        marginHorizontal: padding.sm,
        marginTop: padding.sm,
        paddingTop: padding.xs
      },
      balanceResultsArea: {
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: padding.md,
        marginBottom: padding.md
      },
      textResultsArea: {
        flexDirection: "row",
        margin: padding.sm
      },
      descriptionTitle: {
        ...textAlign.tal,
        flex: 2,
        fontSize: fonts.fontSize.sm,
        color: colors.darkGrey
      },
      descriptionText : {
        ...textAlign.tar,
        flex: 1,
        fontSize: fonts.fontSize.sm,
        color: colors.darkGrey
      },
      balanceTextArea: {
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: padding.sm,
        marginBottom: padding.sm
      },
      balanceTitle: {
        fontSize : fonts.fontSize.sm,
        color: colors.darkGrey
      },
      balanceAmount: {
        fontSize : fonts.fontSize.bt,
        fontWeight: fonts.fontWeight.bold
      },
      receiptOptionsArea: {
        ...miscellaneous.fill,
        marginVertical: padding.sm,
        marginHorizontal: padding.sm
      },
      cautionPanel: {
        marginHorizontal: padding.xs
      },
      errorText: {
        color: colors.bad,
        paddingTop: padding.xs
      },
      textInputError: {
        paddingLeft: padding.xs,
        paddingBottom: padding.xs
      },
      buttonSubTitle: {
        ...buttons.btnSecondayText,
        color: colors.darkGrey,
        fontSize: fonts.fontSize.md,
        paddingTop: padding.xs
      }
    },
    Theme.isTablet
      ? tabletTenderExchangeInScreenStyles()
      : {
        receiptFormStyles: {
          backgroundColor: colors.lightGrey
        }
      }
  );
};

