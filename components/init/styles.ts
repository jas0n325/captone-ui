import Theme from "../../styles";


export const initStyle = () => {
  const { colors } = Theme.styles;
  return {
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.lightGrey
    }
  };
};
