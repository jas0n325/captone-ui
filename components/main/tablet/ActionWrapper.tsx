import * as React from "react";
import { View } from "react-native";

import Theme from "../../../styles";
import { mainStyle } from "./styles";

interface Props {
  children: React.ReactNode;
}

const ActionWrapper: React.FC<Props> = ({ children }: React.PropsWithChildren<Props>): React.ReactElement => {
  const styles = Theme.getStyles(mainStyle())

  return (
    <View style={styles.actionTitle}>
      <View style={styles.actionBody}>
        { children }
      </View>
    </View>
  )
}

export default ActionWrapper;
