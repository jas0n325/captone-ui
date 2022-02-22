import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { AppState } from "../../../reducers";
import Theme from "../../../styles";
import { countOfAllItems, getTestIdProperties } from "../../common/utilities";
import VectorIcon from "../../common/VectorIcon";
import { productInquiryDetailStyle } from "../styles";


interface StateProps {
  itemCount: number;
}

interface Props extends StateProps {
  onPress: () => void;
  testID?: string;
}

class BasketButton extends React.Component<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(productInquiryDetailStyle());
  }

  public renderItemCount = () => this.props.itemCount > 0 && (
    <View style={this.styles.itemCount}>
      <Text
        style={this.styles.itemCountText}
        {...getTestIdProperties(this.props.testID, "itemCount-text")}>
          { this.props.itemCount }
      </Text>
    </View>
  )

  public render(): React.ReactNode {
    return (
        <TouchableOpacity
          style={this.styles.basketButton} onPress={this.props.onPress}
          {...getTestIdProperties(this.props.testID, "basket-button")}>
          <VectorIcon name="Basket" height={28} fill={this.styles.navigationText}/>
          { this.renderItemCount() }
        </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  itemCount: countOfAllItems(state.businessState.displayInfo)
});

export default connect(mapStateToProps)(BasketButton);
