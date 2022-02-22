import Theme from "../../styles";


export const mainStyle = () => {
  const { miscellaneous } = Theme.styles;
  return Theme.merge({
    root: {
      ...miscellaneous.fill,
      alignItems: "center"
    }
  }, Theme.isTablet ? {} : {
    root: {
      justifyContent: "flex-end"
    }
  });
};
