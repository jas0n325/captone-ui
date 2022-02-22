import Theme from "../../styles";


export const openCloseTerminalScreenStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;

  return Theme.merge(
    {
      ...buttons,
      root: {
        ...miscellaneous.fill
      },
      contentBase: {
        ...miscellaneous.fill,
        alignItems: "center",
        backgroundColor: colors.lightGrey
      },
      contentText: {
        alignSelf: "stretch",
        marginLeft: padding.md,
        color: fonts.color,
        fontSize: fonts.fontSize.md,
        marginTop: padding.lg
      },
      datePickerArea: {
        marginTop: padding.xl,
        color: colors.transparent
      },
      tabletButtons: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: padding.md,
        marginHorizontal: padding.xl
      },
      cautionPanel: {
        marginTop: padding.md,
        marginHorizontal: padding.md
      }
    },
    Theme.isTablet
        ? { contentBase: { ...miscellaneous.screen } }
        : {}
  );
};
