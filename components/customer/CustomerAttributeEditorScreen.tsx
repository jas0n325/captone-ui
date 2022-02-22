import * as React from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { ConfigProps, DecoratedComponentClass, InjectedFormProps, reduxForm } from "redux-form";

import { IServiceCustomerAttribute } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import Header from "../common/Header";
import { NavigationScreenProps } from "../StackNavigatorParams";
import CustomerAttributeAddUpdate from "./CustomerAttributeAddUpdate";
import { CustomerAttributeEditorScreenProps } from "./interfaces";
import { customerAttributeEditorStyle } from "./styles";

interface DispatchProps {
  settings: SettingsState;
}

interface Props extends CustomerAttributeEditorScreenProps, DispatchProps, NavigationScreenProps<"attributeEditor"> {}

export interface State {
  custAttribute: IServiceCustomerAttribute;
}

class CustomerAttributeEditorScreen extends React.Component<Props & InjectedFormProps<Props>, State> {
  private styles: any;

  constructor(props: Props & InjectedFormProps<Props>) {
    super(props);

    this.state = {
      custAttribute: props.custAttribute
    };

    this.styles = Theme.getStyles(customerAttributeEditorStyle());
  }

  public render(): JSX.Element {
    const pageHeader = () =>
      <Header
        isVisibleTablet={true}
        title={I18n.t("attribute")}
        backButton={{
          name: "Back",
          action: this.props.onCancel
        }}
        rightButton= {{
          title: I18n.t("add"),
          action: () => this.addCustomerAttributeHandler()
        }}
      />;
    return (
      <View style={this.styles.fill}>
        {pageHeader()}
        <View style={this.styles.root}>
          {this.renderBody()}
        </View>
      </View>
    );
  }

  private addCustomerAttributeHandler(): void {
    this.props.onAdd(this.state.custAttribute);
  }

  private renderBody(): JSX.Element {
    return (
      <KeyboardAwareScrollView keyboardShouldPersistTaps={"always"}>
        <CustomerAttributeAddUpdate
          styles={this.styles}
          titleKey="attributeGroup"
          custAttributes={[this.state.custAttribute]}
          attributeDefs={this.props.attributeDefs}
          isUpdate={this.props.isUpdate}
          singleGroupMode={true}
          uiId={Math.floor(Math.random() * 100000000)}
          onChange={(field: string, value: any) => { return; }}
          navigation={this.props.navigation}
        />
      </KeyboardAwareScrollView>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    settings: state.settings
  };
};

const form = reduxForm<Props>({
  form: "customerAttributeEditorScreen"
})(CustomerAttributeEditorScreen);

export default connect(mapStateToProps)
    (withMappedNavigationParams<DecoratedComponentClass<Props, Partial<ConfigProps<Props, {}, string>>>>()
    (form));





