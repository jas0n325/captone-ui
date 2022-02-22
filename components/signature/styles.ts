import Theme from "../../../ui/styles";


export const tabletSignatureStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.screen
    }
  };
};

export const signatureStyles = () => {
  const { buttons, colors, fonts, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    root: {
      alignItems: "center",
      backgroundColor: colors.white,
      flex: 1
    },
    container: {
      ...miscellaneous.fill,
      padding: padding.md
    },
    title: {
      alignSelf: "stretch",
      fontSize: fonts.fontSize.fm,
      fontWeight: fonts.fontWeight.bold
    },
    description: {
      alignSelf: "stretch",
      fontSize: fonts.fontSize.sm,
      marginTop: padding.xs
    },
    signatureBox: {
      flex: 1,
      marginBottom: padding.xs,
      marginTop: padding.sm,
      borderWidth: 1,
      borderColor: colors.black,
      borderStyle: "dashed",
      borderRadius: 0.5 // a fix to get dashed borders on Android. Is a RN bug.
    },
    signature: {
      flex: 1
    },
    agreement: {
      alignSelf: "stretch",
      color: colors.grey,
      fontSize: fonts.fontSize.sm
    },
    footer: {
      backgroundColor: colors.white,
      justifyContent: "space-evenly"
    },
    button: {
      flex: 0.3
    }
  }, Theme.isTablet ? tabletSignatureStyles() : {});
};

export const signatureCaptureScreenStyles = () => {
  const { miscellaneous } = Theme.styles;
  return {
    ...miscellaneous
  };
};
