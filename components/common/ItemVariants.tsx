import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import Theme from "../../styles";
import { itemVariantsStyle } from "./styles";


export interface Props {
  options: Array<string>;
  activeState?: Map<string, boolean>;
  groupName: string;
  onSelection: (item: string) => void;
  selectedItem: string;
}

export interface State {}

export default class ItemVariants extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(itemVariantsStyle());
  }

  public render(): JSX.Element {
    const { options, activeState, groupName, selectedItem } = this.props;
    return (
      <View style={this.styles.optionItemsContainer}>
        {
          options.map((option: string, index: number) => {
            const optionActive: boolean = !activeState || activeState.has(option);
            return (
              <TouchableOpacity
                onPress={() => this.toggleSelectedOption(option)}
                style={[
                  this.styles.itemContainer,
                  selectedItem && selectedItem === option && this.styles.itemContainerActive,
                  !optionActive && this.styles.disableItem
                ]}
                key={`${groupName}${index}${optionActive}`}
              >
                  <Text style={this.styles.itemText}>{option}</Text>
              </TouchableOpacity>
            );
          })
        }
      </View>
    );
  }

  private toggleSelectedOption(item: string): void {
    const { activeState } = this.props;
    if (!activeState || activeState.has(item)) {
      this.props.onSelection(item);
    }
  }
}
