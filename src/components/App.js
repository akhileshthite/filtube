import React, { Component } from "react";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import Navbar from "./Navbar";
import Main from "./Main";
import Footer from "./Footer";
import Web3 from "web3";
import "./App.css";
require("dotenv").config();

const token = process.env.REACT_APP_API_TOKEN;
const client = new Web3Storage({ token });

const loaderStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    // Network ID
    const networkId = "31415"
    const networkData = networkId;
    const abi = [
      {
        "constant": false,
        "inputs": [
          {
            "name": "_videoHash",
            "type": "string"
          },
          {
            "name": "_title",
            "type": "string"
          }
        ],
        "name": "uploadVideo",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "id",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "hash",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "title",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "author",
            "type": "address"
          }
        ],
        "name": "VideoUploaded",
        "type": "event"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "videoCount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "videos",
        "outputs": [
          {
            "name": "id",
            "type": "uint256"
          },
          {
            "name": "hash",
            "type": "string"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "author",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ]
    const contractAddress = "0xb48c947d9e6a38bbb64823De5F79a16d48D3d3a8"
    if (networkData) {
      const FilTube = new web3.eth.Contract(abi, contractAddress);
      this.setState({ FilTube });
      const videosCount = await FilTube.methods.videoCount().call();
      this.setState({ videosCount });
      // Load videos, sort by newest
      for (var i = videosCount; i >= 1; i--) {
        const video = await FilTube.methods.videos(i).call();
        this.setState({
          videos: [...this.state.videos, video],
        });
      }
      //Set latest video with title to view as default
      const latest = await FilTube.methods.videos(videosCount).call();
      this.setState({
        currentHash: latest.hash,
        currentTitle: latest.title,
      });
      this.setState({ loading: false });
    } else {
      window.alert("FilTube contract not deployed to detected network.");
    }
  }

  captureFile = (event) => {
    event.preventDefault();
    const file = document.querySelector('input[type="file"]');
    return this.setState({ file: file });
  };

  async uploadVideo(title) {
    console.log("Submitting file to IPFS...");
    const videoFile = this.state.file;
    //adding file to the IPFS
    const cid = await client.put(videoFile.files, { wrapWithDirectory: false });
    this.setState({ loading: true });
    this.state.FilTube.methods
      .uploadVideo(cid, title)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  }

  changeVideo = (hash, title) => {
    this.setState({ currentHash: hash });
    this.setState({ currentTitle: title });
  };

  constructor(props) {
    super(props);
    this.state = {
      file: null,
      account: "",
      FilTube: null,
      videos: [],
      loading: true,
      currentHash: null,
      currentTitle: null,
    };

    this.uploadVideo = this.uploadVideo.bind(this);
    this.captureFile = this.captureFile.bind(this);
    this.changeVideo = this.changeVideo.bind(this);
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading ? (
          <div id="loader" style={loaderStyle}>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <Main
              videos={this.state.videos}
              account={this.state.account}
              uploadVideo={this.uploadVideo}
              captureFile={this.captureFile}
              changeVideo={this.changeVideo}
              currentHash={this.state.currentHash}
              currentTitle={this.state.currentTitle}
            />
            <Footer />
          </>
        )}
      </div>
    );
  }
}

export default App;
