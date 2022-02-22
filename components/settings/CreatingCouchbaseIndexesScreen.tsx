import * as React from "react";
import { Text, View } from "react-native";
import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { NavigationScreenProps } from "../StackNavigatorParams";
import AptosLogoNavigationBar from "./AptosLogoNavigationBar";
import { terminalStyle } from "./styles";

interface Props extends NavigationScreenProps<"creatingCouchbaseIndexes"> {}

interface State {}

class CreatingCouchbaseIndexesScreen extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.state = {};

    this.styles = Theme.getStyles(terminalStyle());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.screenContainer}>
        <AptosLogoNavigationBar styles={this.styles}/>
        <View style={this.styles.settings}>
          {this.creatingIndexes()}
        </View>
      </View>
    );
  }

  private creatingIndexes(): JSX.Element {
    return (
      <Text style={this.styles.buttonText}>
        {I18n.t("creatingCouchbaseIndexes")}
      </Text>
    );
  }
}

export default CreatingCouchbaseIndexesScreen;
