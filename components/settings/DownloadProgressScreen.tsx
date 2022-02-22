import * as React from "react";
import { Text, View } from "react-native";

import {
  addDatabaseDownloadListener,
  DatabaseDownloadProgress,
  DatabaseDownloadStatus,
  EventSubscription
} from "@aptos-scp/scp-component-rn-datasync";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { NavigationScreenProps } from "../StackNavigatorParams";
import AptosLogoNavigationBar from "./AptosLogoNavigationBar";
import { terminalStyle } from "./styles";

interface Props extends NavigationScreenProps<"downloadProgress"> {}

interface State extends Pick<DatabaseDownloadProgress, "status" | "contentLength" | "bytesWritten"> { }

class DownloadProgressScreen extends React.Component<Props, State> {
  private styles: any;
  private removeDownloadEventSubscription: EventSubscription;

  public constructor(props: Props) {
    super(props);

    this.state = {
      status: DatabaseDownloadStatus.downloading
    };

    this.styles = Theme.getStyles(terminalStyle());
  }

  public componentDidMount(): void {
    const self = this;

    this.removeDownloadEventSubscription =
        addDatabaseDownloadListener((p: DatabaseDownloadProgress) => self.setState(p));
  }

  public componentWillUnmount(): void {
    if (this.removeDownloadEventSubscription) {
      this.removeDownloadEventSubscription();
      this.removeDownloadEventSubscription = undefined;
    }
  }

  public render(): JSX.Element {
    const { status, contentLength, bytesWritten } = this.state;

    return (
      <View style={this.styles.screenContainer}>
        <AptosLogoNavigationBar styles={this.styles}/>
        <View style={this.styles.settings}>
          {status === DatabaseDownloadStatus.downloading && this.renderDownloading(contentLength, bytesWritten)}
          {status === DatabaseDownloadStatus.unzipping && this.renderUnzipping()}
          {status === DatabaseDownloadStatus.installing && this.renderInstalling()}
        </View>
      </View>
    );
  }

  private renderDownloading(contentLength: number, bytesWritten: number): JSX.Element {
    let progress = 0;

    if (!isNaN(contentLength) && !(isNaN(bytesWritten)) && contentLength > 0) {
      progress = Math.round((bytesWritten * 100) / contentLength);
    }

    return (<Text style={this.styles.buttonText}>{I18n.t("downloadingDatabase")}: {progress}%</Text>);
  }

  private renderUnzipping(): JSX.Element {
    return (<Text style={this.styles.buttonText}>{I18n.t("downloadingDatabaseDecompressing")}</Text>);
  }

  private renderInstalling(): JSX.Element {
    return (<Text style={this.styles.buttonText}>{I18n.t("downloadingDatabaseInstalling")}</Text>);
  }
}

export default DownloadProgressScreen;
