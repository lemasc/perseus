const PropTypes = require('prop-types');
/**
 * Component to display an image (or other React components) while the desired
 * image is loading.
 *
 * Derived from
 * https://github.com/hzdg/react-imageloader/blob/master/src/index.js
 * to better suit our environment/build tools. Additionally, this one does
 * not introduce a wrapper element, which makes styling easier.
 */

const React = require("react");

const Status = {
    PENDING: "pending",
    LOADING: "loading",
    LOADED: "loaded",
    FAILED: "failed",
};

class ImageLoader extends React.Component {
    static propTypes = {
        children: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.node),
            PropTypes.node,
        ]),
        imgProps: PropTypes.any,
        onError: PropTypes.func,
        onLoad: PropTypes.func,

        // When the DOM updates to replace the preloader with the image, or
        // vice-versa, we trigger this callback.
        onUpdate: PropTypes.func,

        preloader: PropTypes.func,
        src: PropTypes.string,
    }

    constructor(props) {
        super(props)
        this.state = {status: props.src ? Status.LOADING : Status.PENDING};
    }

    componentDidMount() {
        if (this.state.status === Status.LOADING) {
            this.createLoader();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.src !== nextProps.src) {
            this.setState({
                status: nextProps.src ? Status.LOADING : Status.PENDING,
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.status === Status.LOADING && !this.img) {
            this.createLoader();
        }

        if (prevState.status !== this.state.status) {
            this.props.onUpdate();
        }
    }

    componentWillUnmount() {
        this.destroyLoader();
    }

    createLoader() {
        this.destroyLoader(); // We can only have one loader at a time.

        this.img = new Image();
        this.img.onload = this.handleLoad;
        this.img.onerror = this.handleError;
        this.img.src = this.props.src;
    }

    destroyLoader() {
        if (this.img) {
            this.img.onload = null;
            this.img.onerror = null;
            this.img = null;
        }
    }

    handleLoad = (event) => {
        this.destroyLoader();
        this.setState({status: Status.LOADED});

        if (this.props.onLoad) {
            this.props.onLoad(event);
        }
    }

    handleError = (error) => {
        this.destroyLoader();
        this.setState({status: Status.FAILED});

        if (this.props.onError) {
            this.props.onError(error);
        }
    }

    renderImg = () => {
        const {src, imgProps} = this.props;
        const props = {src};

        for (const k in imgProps) {
            if (imgProps.hasOwnProperty(k)) {
                props[k] = imgProps[k];
            }
        }

        return <img {...props} />;
    }

    render() {
        switch (this.state.status) {
            case Status.LOADED:
                return this.renderImg();

            case Status.FAILED:
                if (this.props.children) {
                    return this.props.children;
                }
                break;
            default:
                if (this.props.preloader) {
                    return this.props.preloader();
                }
        }
        return null;
    }
}

module.exports = ImageLoader;
