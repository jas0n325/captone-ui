import Theme from "../../styles";


export const basketActionsScreenStyles = () => {
  const { colors, miscellaneous } = Theme.styles;

  return {
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey
    }
  };
};
