import { getBottomSpace } from "react-native-iphone-x-helper";

import Theme from "../../styles";


export const tabletPreferencesStyle = () => {
  const { miscellaneous, padding , colors} = Theme.styles;
  return {
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.white
    },
    subtitleArea: {
      height: miscellaneous.banner.height * 0.7
    },
    btnArea: {
      ...miscellaneous.screenActions,
      paddingVertical: padding.lg + 2
    }
  };
};

export const preferencesDisplayScreenStyle = () => {
  const { miscellaneous } = Theme.styles;
  return {
    root: {
      ...miscellaneous.fill
    }
  };
};

export const preferencesUpdateStyle = () => {
  const { buttons, colors, fonts, forms, miscellaneous, padding } = Theme.styles;
  return Theme.merge({
    ...buttons,
    ...forms,
    ...miscellaneous,
    root: {
      ...miscellaneous.fill,
      backgroundColor: colors.lightGrey,
      justifyContent: "flex-start"
    },
    actions: {
      ...miscellaneous.panel,
      padding: padding.md - 4
    },
    button: {
      justifyContent: "center",
      marginBottom: padding.sm - 2
    },
    icon: {
      fontSize: fonts.fontSize.bt,
      color: colors.darkerGrey
    },
    arrowArea: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "stretch"
    },
    controlsRow: {
      alignItems: "center",
      backgroundColor: colors.white,
      borderBottomColor: colors.grey,
      borderBottomWidth: 1,
      flexDirection: "row",
      height: forms.input.height,
      justifyContent: "flex-start",
      paddingHorizontal: padding.md - 4,
      width: "100%"
    }
  }, Theme.isTablet ? tabletPreferencesStyle() : {
    root: {
      paddingBottom: getBottomSpace()
    }
  });
};
