import * as React from "react";
import { View } from "react-native";
import { connect } from "react-redux";

import { IDisplayInfo, IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import ActionButton from "../common/ActionButton";
import Header from "../common/Header";
import { IFeatureActionButtonProps } from "../common/utilities";
import { NavigationProp } from "../StackNavigatorParams";
import { TaxActionPanelProps } from "./interfaces";
import { taxActionPanelStyle } from "./styles";

interface StateProps {
  featureActionButtonProps: IFeatureActionButtonProps;
  displayInfo: IDisplayInfo;

}

interface Props extends TaxActionPanelProps, StateProps {
  navigation: NavigationProp;
}

class TaxActionPanel extends React.PureComponent<React.PropsWithChildren<Props>> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(taxActionPanelStyle());
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t("tax")}
          backButton={{ name: "Back", action: this.props.onExit }}
        />
        <View style={this.styles.actionsPanel}>
          <View style={this.styles.actions}>
            {((this.props.isItemLevel && this.props.featureActionButtonProps.isItemTaxExemptVisible) ||
              (!this.props.isItemLevel && this.props.featureActionButtonProps.isTransactionTaxExemptVisible)) &&
              <ActionButton style={this.styles.btnAction}
                            icon={{icon: "TaxExempt", size: this.styles.btnActionIcon.fontSize}}
                            title={I18n.t("taxExempt")}
                            allowTextWrap={true}
                            titleStyle={this.styles.btnActionText}
                            onPress={this.onTaxExempt}/>
            }
            {((this.props.isItemLevel && this.props.featureActionButtonProps.isMarkItemTaxOverrideVisible) ||
              (!this.props.isItemLevel && this.props.featureActionButtonProps.isTransactionTaxOverrideVisible)) &&
            <ActionButton style={this.styles.btnAction}
                          icon={{icon: "TaxOverride", size: this.styles.btnActionIcon.fontSize}}
                          title={I18n.t("taxOverride")}
                          titleStyle={this.styles.btnActionText}
                          onPress={this.onTaxOverride}
                          allowTextWrap={true}
                          />
            }
            {
              this.styles.lastBtn && <View style={this.styles.lastBtn} />
            }
          </View>
          {this.props.children}
        </View>
      </View>
    );
  }

  private getItemLine(): IItemDisplayLine {
    return this.props.displayInfo.itemDisplayLines.find(
      (itemDisplayLine: IItemDisplayLine ) => {
        return itemDisplayLine.lineNumber === this.props.lineNumber;
      }
    );
  }

  private onTaxExempt = (): void => {
    if (this.getItemLine()) {
      this.props.onItemTaxExempt(this.getItemLine());
    } else {
      this.props.onTransactionTaxExempt();
    }
  }

  private onTaxOverride = (): void => {
    if (this.props.lineNumber) {
      this.props.onItemTaxOverride(this.getItemLine());
    } else {
      this.props.onTransactionTaxOverride();
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    featureActionButtonProps: state.uiState.featureActionButtonProps,
    displayInfo: state.businessState.displayInfo
  };
};

export default connect(mapStateToProps)(TaxActionPanel);
