import * as _ from "lodash";
import * as React from "react";
import { ScrollView, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";

import { IImage } from "@aptos-scp/scp-component-store-items";

import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import ImageViewer from "./ImageViewer";
import { carouselStyle } from "./styles";

export interface Props {
  images: IImage[];
  thumbnails: boolean;
  numberOfImages?: number;
  style?: ViewStyle;
  imageStyle?: StyleProp<ViewStyle>;
  imageHeight?: number;
  imageWidth?: number;
  settings: SettingsState;
}
export interface State {
  images: IImage[];
  selected: number;
  availableWidth: number;
}

export default class Carousel extends React.Component<Props, State> {
  private styles: any;
  private scrollViewRef: ScrollView;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(carouselStyle());

    this.state = {
      images: this.getImages(props.images, props.numberOfImages),
      selected: 0,
      availableWidth: undefined
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (!_.isEqual(prevProps.images.sort(), this.props.images.sort())) {
      this.setState( { images : this.getImages(this.props.images, this.props.numberOfImages), selected: 0});
    }
  }

  public render(): JSX.Element {
    const images = this.state.images;
    const { style, thumbnails, imageStyle, imageHeight, imageWidth, settings } = this.props;
    if (images.length === 1) {
      return (
        <View style={[this.styles.container, style || {}]}>
          <ImageViewer
              image={images[0].imageUrl}
              style={imageStyle}
              height={imageHeight}
              width={imageWidth}
              settings={settings}
          />
        </View>
      );
    } else {
      const dots: JSX.Element[]  = [];
      images.forEach((image, i) => {
        const isSelected: boolean = this.state.selected === i;
        if (!thumbnails) {
          if (isSelected) {
            dots.push(
              <View style={[this.styles.dotOuter, this.styles.dotSelected]}>
                <View style={[this.styles.dotFilter]}>
                  <View style={[this.styles.dot, this.styles.dotSelected]} />
                </View>
              </View>
            );
          } else {
            dots.push(<View style={[this.styles.dot, this.styles.dotUnselected]} />);
          }
        } else {
          dots.push(
            <TouchableOpacity
                style={[this.styles.thumbnail, isSelected ? this.styles.thumbnailSelected : {}]}
                onPress={this.scrollToItem.bind(this, i)}>
              <ImageViewer
                image={image.imageUrl}
                height={imageHeight ? imageHeight / 4.5 : undefined}
                width={imageWidth ? imageWidth / 4.5 : undefined}
                settings={settings}
              />
            </TouchableOpacity>
          );
        }
      });

      return (
        <View style={[this.styles.container, style || {}]} onLayout={(event) =>
          this.setState({ availableWidth: event.nativeEvent.layout.width })
        }>
          <ScrollView
              ref={(ref: any) => this.scrollViewRef = ref }
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              scrollEnabled={true}
              pagingEnabled={true}
              onMomentumScrollEnd={this.onScroll.bind(this)}>
            {images.map((image) =>
              <ImageViewer
                  image={image.imageUrl}
                  style={[imageStyle || {}, { width: this.state.availableWidth }]}
                  height={imageHeight}
                  width={imageWidth}
                  settings={settings}
              />
            )}
          </ScrollView>
          <View style={this.styles.dotPanel}>
            {dots}
          </View>
        </View>
      );
    }
  }

  private getImages(images: IImage[], numberOfImages: number): IImage[] {
    const visibleImages = numberOfImages ? numberOfImages : 5;
    const primaryImage: number = images.findIndex((image) => image.primaryImage);
    const values: IImage[] = [...images.filter((image, index) => index !== primaryImage)];
    if (primaryImage > -1) {
      values.splice(0, 0, images[primaryImage]);
    }
    if (values.length > visibleImages) {
      values.length = visibleImages;
    }
    return values;
  }

  private onScroll(event: any): void {
    this.setState({ selected: Math.ceil(event.nativeEvent.contentOffset.x / this.state.availableWidth) });
  }

  private scrollToItem(index: number): void {
    requestAnimationFrame(() => {
      this.setState({ selected: index});
      this.scrollViewRef.scrollTo({x: this.state.availableWidth * index, y: 0, animated:true});
    });
  }
}
