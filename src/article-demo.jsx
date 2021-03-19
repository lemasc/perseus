const PropTypes = require('prop-types');
/**
 * Demonstrates the rendered result of a Perseus article
 */

const React = require("react");
const ArticleEditor = require("./article-editor.jsx");
const StatefulArticleEditor = require("./stateful-article-editor.jsx");
const Util = require("./util.js");

const defaultArticle = [
    {
        content: "",
        images: {},
        widgets: {}
    }
];

class ArticleDemo extends React.Component {
    static propTypes = {
        content: PropTypes.any.isRequired,
    }

    static defaultProps = {
            content: defaultArticle,
        };

    constructor(props) {
        super(props);
        this.state = {
            isMobile: navigator.userAgent.indexOf("Mobile") !== -1,
        };
    }

    componentDidMount() {
        window.addEventListener("resize", this._handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this._handleResize);
    }

    serialize = () => {
        console.log(JSON.stringify(this.refs.editor.serialize(), null, 4)); // eslint-disable-line no-console
    }

    scorePreview = () => {
        console.log(this.refs.editor.scorePreview()); // eslint-disable-line no-console
    }

    _getContentHash = () => {
        return Util.strongEncodeURIComponent(
            JSON.stringify(this.refs.editor.serialize())
        );
    }

    permalink = (e) => {
        window.location.hash = `content=${this._getContentHash()}`;
        e.preventDefault();
    }

    _handleResize() {
        const isMobile = navigator.userAgent.indexOf("Mobile") !== -1;
        if (this.state.isMobile !== isMobile) {
            this.setState({isMobile});
        }
    }

    getEditorProps() {
        const {isMobile} = this.state;

        return {
            json: this.props.content,
            imageUploader: function(image, callback) {
                setTimeout(callback, 1000, "http://fake.image.url");
            },
            apiOptions: {
                customKeypad: isMobile,
                onFocusChange: function(newPath, oldPath) {
                    console.log("onFocusChange", newPath, oldPath); // eslint-disable-line no-console
                },
                trackInteraction: function(trackData) {
                    console.log( // eslint-disable-line no-console
                        "Interaction with",
                        trackData.type,
                        trackData
                    );
                },
                isMobile,
            },

            useNewStyles: true,
            componentClass: ArticleEditor,
        };
    }

    render() {
        return (
            <div id="perseus-index">
                <div id="extras">
                    <button onClick={this.serialize}>serialize</button>{" "}
                    <button onClick={this.scorePreview}>score</button>{" "}
                    <button onClick={this.permalink}>permalink</button>{" "}
                </div>
                <div style={{margin: 20}}>
                    <StatefulArticleEditor
                        ref="editor"
                        {...this.getEditorProps()}
                    />
                </div>
            </div>
        );
    }
}

module.exports = ArticleDemo;
