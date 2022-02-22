import * as React from "react";
import { Text, View } from "react-native";

import Theme from "../../../styles";
import { productInquiryDetailStyle } from "../styles";

interface Props {
  isReadOnly: boolean;
  variantLabel: string;
  variantInfoLabel: string;
  renderVariants: () => React.ReactNode;
}

class ProductInquiryAttribute extends React.PureComponent<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(productInquiryDetailStyle());
  }

  public render(): React.ReactNode {
    return (
      <View style={[this.attributeStyles.subVariantContainerStyles, this.attributeStyles.subInfoVariantsStyles]}>
        <Text style={this.attributeStyles.variantLabel}>
          {this.props.variantLabel}
        </Text>
        {
          this.props.isReadOnly &&
          <Text style={this.styles.variantInfoLabel}>
            { this.props.variantInfoLabel }
          </Text>
        }
        { !this.props.isReadOnly && this.props.renderVariants() }
      </View>
    );
  }

  private get attributeStyles(): any {
    let subInfoVariantsStyles = this.styles.subInfoWithVariants;
    let subVariantContainerStyles = this.styles.subVariantContainer;
    let variantLabel = this.styles.variantLabel;

    if (this.props.isReadOnly) {
      subInfoVariantsStyles = this.styles.subInfoWithoutVariants;
      subVariantContainerStyles = this.styles.subInfoVariant;
      variantLabel = this.styles.variantStaticLabel;
    }

    return { subInfoVariantsStyles, subVariantContainerStyles, variantLabel };
  }
}

export default ProductInquiryAttribute;
