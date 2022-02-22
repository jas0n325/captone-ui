import Theme from "../../styles";


export const receiptOptionFormStyle = () => {
  const { buttons, colors, miscellaneous, padding } = Theme.styles;

  return Theme.merge({
    ...buttons,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    receiptOptionsArea: {
      alignSelf: "stretch",
      paddingHorizontal: padding.md
    },
    receiptButton: {
      marginBottom: padding.sm
    },
    bottomMostReceiptButton: {
      marginBottom: padding.md
    },
    spinnerContainer: {
      marginVertical: padding.lg
    }
  }, Theme.isTablet ? tabletReceiptOptionFormStyle() : {});
};

export const tabletReceiptOptionFormStyle = () => {
  const { miscellaneous, padding } = Theme.styles;

  return ({
    root: {
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: padding.md
    },
    receiptOptionsArea: {
      ...miscellaneous.fill
    },
    spinnerContainer: {
      alignItems: "center",
      justifyContent: "center"
    }
  });
};

export const tabletReprintReceiptStyle = () => {
  const { padding } = Theme.styles;
  return {
    root: {
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: "25%",
      paddingTop: padding.md
    }
  };
};

export const phoneReprintReceiptStyle = () => {
  const { padding } = Theme.styles;

  return {
    root: {
      marginTop: padding.md
    }
  };
};

export const reprintReceiptStyles = () => {
  const { colors, miscellaneous } = Theme.styles;

  return Theme.merge({
    ...miscellaneous.fill,
    base: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    root: {
      ...miscellaneous.fill
    }
  }, Theme.isTablet ? tabletReprintReceiptStyle() : phoneReprintReceiptStyle());
};

export const receiptSummaryScreenStyles = () => {
  return {
    root: {
      width: "100%",
      height: "100%"
    }
  };
};
