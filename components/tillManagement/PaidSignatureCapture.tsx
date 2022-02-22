import { SketchCanvas } from "@terrylinla/react-native-sketch-canvas";
import { encode } from "base-64";
import * as React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import * as RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import Footer from "../common/Footer";
import { tillDetailStyles } from "./styles";

const logger: ILogger = LogManager.
    getLogger("com.aptos.storeselling.ui.components.tillManagement.PaidSignatureCapture");

interface State {
  isSignatureEmpty: boolean;
}

interface Props {
  onSignatureReceived: (encoded: string, encodedDataPoints: string) => void;
}

export default class PaidSignatureCapture extends React.Component<Props, State> {
  private styles: any;
  private signature: any;

  public constructor(props: Props) {
    super(props);
    this.state = {
      isSignatureEmpty: false
    };

    this.styles = Theme.getStyles(tillDetailStyles());
    }

  public render(): JSX.Element {

    return (
      <View style={this.styles.container}>
        <Text style={this.styles.textTitle}>{I18n.t("managerSignature")}</Text>
        <View style={this.styles.signatureBox}>
          <SketchCanvas
            style={this.styles.signature}
            ref={(ref: any) => this.signature = ref } />
        </View>
        { this.state.isSignatureEmpty &&
          <Text style={this.styles.inputErrorText}>{I18n.t("required",
              {field: I18n.t("printReceipts.signature")})}</Text>
        }
        <Footer style={this.styles.footer}>
          <TouchableOpacity
            onPress={() => this.signature.clear()}
            style={this.styles.btnSignatureSecondary}
          >
            <Text style={this.styles.btnSecondayText}>
              {I18n.t("clear")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.signature.getBase64("png", false, true, false, false, this.saveEvent.bind(this))}
            style={this.styles.btnSignaturePrimary}
          >
            <Text style={this.styles.btnPrimaryText}>
              {I18n.t("accept")}
            </Text>
          </TouchableOpacity>
        </Footer>
      </View>
    );
  }

  private saveEvent(error: any, result: string): void {
    const dataPoints: string[][] = [];
    this.signature.getPaths().forEach((line: any) => {
      dataPoints.push(line.path.data);
    });
    if (dataPoints.length === 0) {
      this.setState({isSignatureEmpty: true});
      return;
    }
    const encodedDataPoints: string = this.convertDataPoints(dataPoints);

    if (error) {
      logger.catching(error, "Error while saving the base64 image");
      this.props.onSignatureReceived(`data:image/png;base64,${result}`, encodedDataPoints);
    } else {
      // Get the base64 of the original signature file (png) and based on the length it gets a factor to apply to the
      // quality so the final jpeg doesn't exceed the max 20kb supported by the final device
      const factor: number = Math.ceil(result.length / 20480);

      const updatedResult: string = `data:image/png;base64,${result}`;

      // The signature would be retained when poping for multiple sigs in a row,
      // due to component not unmounting, added clear on save to resolve.
      this.signature.clear();

      // Get the image width and height to scale it proportionally
      Image.getSize(updatedResult, (width: number, height: number) => {
        ImageResizer.createResizedImage(updatedResult, width / 2, height / 2,
            "JPEG", Math.floor(100 / factor)).then(({uri, size}) => {
          return RNFS.readFile(uri, "base64");
        }).then((encoded) => {
          this.props.onSignatureReceived(`data:image/jpeg;base64,${encoded}`, encodedDataPoints);
        }).catch((err) => {
          logger.catching(err, `Error while converting ${updatedResult} to JPEG`);
          this.props.onSignatureReceived(`data:image/png;base64,${result}`, encodedDataPoints);
        });
      }, (err: any) => {
        logger.catching(err, `Error while getting the size for ${result}`);
        this.props.onSignatureReceived(`data:image/png;base64,${result}`, encodedDataPoints);
      });
    }
  }

  private convertDataPoints(dataPoints: string[][]): string {
    const byteArray: number[] = [];

    dataPoints.forEach((segment: string[]) => {
      segment.forEach((points: string) => {
          const splitPoints: string[] = points.split(",");
          const x: number = +splitPoints[0];
          const y: number = +splitPoints[1];
          // tslint:disable-next-line:no-bitwise
          byteArray.push(x & 0xFF);
          // tslint:disable-next-line:no-bitwise
          byteArray.push((x & 0xFF00) >> 8);
          // tslint:disable-next-line:no-bitwise
          byteArray.push(y & 0xFF);
          // tslint:disable-next-line:no-bitwise
          byteArray.push((y & 0xFF00) >> 8);
      });
      // pen up
      byteArray.push(0xFF, 0xFF, 0xFF, 0xFF);
    });

    return encode(String.fromCharCode(...new Uint8Array(byteArray)));
  }

}
