import * as React from "react";
import { Text, View } from "react-native";

import Theme from "../../../styles";
import { productInquiryDetailStyle } from "../styles";

interface Props {
  label: string;
  value: string;
}

class ProductInquiryInfoContainer extends React.PureComponent<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(productInquiryDetailStyle());
  }

  public render(): React.ReactNode {
    return (
      <>
        {
          this.props.value &&
          <View style={this.styles.infoContainer}>
            <View style={[this.styles.subInfoVariant, this.styles.subInfoWithoutVariants]}>
              <Text style={this.styles.variantStaticLabel}>
                { this.props.label }
              </Text>
              <Text style={this.styles.variantInfoLabel}>
                { this.props.value }
              </Text>
            </View>
          </View>
        }
      </>
    );
  }
}

export default ProductInquiryInfoContainer;
