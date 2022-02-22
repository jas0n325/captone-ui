import Theme from "../../styles";


export const stoppedItemScreenStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;

  return Theme.merge(
    {
      ...buttons,
      root: {
        ...miscellaneous.fill,
        backgroundColor: colors.lightGrey
      },
      stoppedExplainedText: {
        color: colors.darkGrey,
        fontSize: fonts.fontSize.sm,
        marginTop: padding.md,
        marginHorizontal: padding.sm + 5
      },
      reasonText: {
        color: colors.darkerGrey,
        fontWeight: fonts.fontWeight.medium
      },
      button: {
        marginTop: padding.sm
      }
    },
    Theme.isTablet ? {
      root: {
        backgroundColor: colors.white
      }
    } : {}
  );
};
