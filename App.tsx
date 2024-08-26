import { useRef, useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, Pressable, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import React from 'react';
import { Checkbox } from './components/Checkbox';
import { useStore } from './store';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import Octicons from '@expo/vector-icons/Octicons';
import * as Clipboard from 'expo-clipboard';
import { DataPost, Group } from './types';
import { BtnTab } from './components/BtnTab';
import Constants from 'expo-constants';



export default function App() {

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/rafacu-dev/remote-config/main/multi_post.json')
        .then(response => response.json())
        .then(json => {
            const version = parseFloat(Constants.manifest2.extra.expoClient.version)


            if(parseFloat(json.minVersion) > version) Alert.alert(
                "Necessary update",
                "To continue enjoying the application it is necessary to update it",
                [
                  { text: "Update"}
                ]
            );
            
        })
        .catch(error => console.error('Error fetching data:', error));
    }, []); 
    
    const webviewRef = useRef(null);
    const [loginRequired, setLoginRequired] = useState(false)
    const [loadingGroups, setLoadingGroups] = useState(false)
    const [isWebViewLoading, setIsWebViewLoading] = useState(false)
    const [isPosting, setIsPosting] = useState(false)

    const { groups, setGroups } = useStore()
    

    const [postUrl, setPostUrl] = useState('');
    const [dataPost, setDataPost] = useState<DataPost>();
    const [groupGetData, setGroupGetData] = useState<Group>();
    
    
    const [url, setUrl] = useState<string>(postUrl && !dataPost?postUrl:'https://www.facebook.com/' );
    
    const [groupPostingLoading, setGroupPostingLoading] = useState('');

    const handlerPressFace = () => {
        if(isPosting || loadingGroups) return;
        setTabSelected("facebook"); 
        setUrl('https://www.facebook.com/')        
        webviewRef?.current.reload()
    }
    
    const handlerPressMultipost = () => {
        if(loginRequired) {
            Alert.alert(
                "Login Required",
                "No guardamos ninguno de sus datos, todos los datos se almacenan en su dispositivo.",
                [
                  { text: "OK" }
                ]
            );
        }
        else if((!groups.length && !loadingGroups) || (groups.length === 0 && !loadingGroups)) {
            setTabSelected("mp");
            setUrl('https://www.facebook.com/');//groups/joins/?nav_source=tab&ordering=viewer_added
            setTimeout(function() {
                getGroups2();
            }, 2000);
        }
        else setTabSelected("mp");
            
    }
    
    const handlerPressReload = () => {
        setUrl('https://www.google.com/')
        setLoadingGroups(true)
        
        
        setTimeout(function() {
            setUrl('https://www.facebook.com/');//groups/joins/?nav_source=tab&ordering=viewer_added
            setTimeout(function() {
                    setGroups([])
                    getGroups2();
            }, 2000);
        }, 200);
    }

    const handlePaste = async () => {
        const clipboardContent: string = await Clipboard.getStringAsync();

        if(!clipboardContent || !clipboardContent.trim().includes('https://www.facebook.com/')) {
            Alert.alert(
                "Invalid Link",
                "You must paste a valid link from a Facebook post.",
                [
                  { text: "OK" }
                ]
            );
        }
        else{
            setDataPost(undefined)
            if(clipboardContent === url){
                webviewRef?.current.reload()
                setUrl(clipboardContent);
                setPostUrl(clipboardContent);
            }
            else{
                setUrl(clipboardContent);
                setPostUrl(clipboardContent);
            }
        }
    };

    const handleSendPost = () => {
        if(isPosting) return;
        setIsPosting(true);
        //sendPostOld();
        sendPost(0)
        
        const selectedSendGroups:Group[] = Array.from(groups.filter(g => g.select === true))
        setGroupPostingLoading(selectedSendGroups[0].url)
    }

    const [tabSelected,setTabSelected] = useState<"facebook"|"mp">("facebook");
    
    const old = () => {
        const jsCode = `
        setTimeout(function() {
            const bodyText = document.body.textContent || document.body.innerText;
            if(bodyText.includes('Forgot password?')){
                const jsonString = JSON.stringify({
                    key: 'login',
                });
                window.ReactNativeWebView.postMessage(jsonString);
            }
            else if(${groups.length === 0}) {
                const jsonString = JSON.stringify({
                    key: 'loadingGroups',
                    value: true
                });
                window.ReactNativeWebView.postMessage(jsonString);
                
                const div = document.querySelector('div[aria-label="Facebook Menu"]');
                const childDivs = div.querySelectorAll('div');
                childDivs[0].click();

                const groupsBtn = document.querySelector('div[data-comp-id="3"]');
                groupsBtn.click();

                setTimeout(function() {
                    const yourGroupsBtn = document.querySelector('div[aria-label="Your groups"]');
                    yourGroupsBtn.click();
                    

                    setTimeout(function() {
                        const dataGroups = [];
                        const images = document.querySelectorAll('img');
                        const namesDiv = document.querySelectorAll('div[data-mcomponent="ServerTextArea"]');
                        const names = Array.from(document.querySelectorAll('div[data-type="text"]'))
                        .slice(25)
                        .filter(item => item.innerText.trim() !== '...' && item.innerText.trim() !== '');

                        let i = 0;
                        images.forEach((img) => {
                            dataGroups.push({
                                name:names[i].innerText,
                                img:img.src,
                                url: "",
                                select: false
                            });
                            i += 2
                        });
                        
                        const jsonString = JSON.stringify({
                            key: 'groups',
                            value: dataGroups
                        });
                        window.ReactNativeWebView.postMessage(jsonString);

                    }, 2000);
                }, 2000);
                
            }
            else if(false) {
                const targetDiv = document.querySelectorAll('div[data-mcomponent="MContainer"]');
                targetDiv.forEach(div => {
                    if (div.innerHTML.toString().includes('Write something...')) {
                        div.click();
                        setTimeout(function() {
                            const textDiv = document.querySelector('div[aria-label="Write something"]');
                            textDiv.click();
                            const textarea = document.querySelector('textarea');
                            textarea.value = 'https://www.facebook.com/story.php?story_fbid=122097208382346143&id=61560384299577&mibextid=WC7FNe&rdid=wJSMrEmylTo0MylW';
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            
                            const scrollable = document.querySelector('div[data-is-h-scrollable="true"]');
                            scrollable.children[0].click();
                            setTimeout(function() {
                                const btn = document.querySelector('div[aria-label="POST"]');
                                btn.click();
                            }, 2000);
                            
                        }, 2000);
                    }
                });            
            }

        }, 2000);
        true;`;
        webviewRef?.current.injectJavaScript(jsCode);
        
    };
    
    const searchLoginRequired = async () => {
        async function send() { 
            setTimeout(
                function() {
                    const jsCode = `
                    async function jsInject() { 
                        setTimeout( function() {  
                            const bodyText = document.body.textContent || document.body.innerText;
                            const jsonString = JSON.stringify({
                                key: 'login',
                                value: bodyText.includes('Forgot password?')
                            });
                            window.ReactNativeWebView.postMessage(jsonString);
                        }, 2000);
                    }                    
                    (function() {
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', function() {
                                jsInject()
                            });
                        } else {
                            jsInject()
                        }
                    })();                   
                    true;`;
                    webviewRef?.current.injectJavaScript(jsCode);
            }, 200);
        }
        
        send();
        
    };

    const sendPost = async (indexSendingPost: number) => {
        const selectedSendGroups:Group[] = Array.from(groups.filter(g => g.select === true))
        async function send() { 
            setUrl(`https://facebook.com/groups/${selectedSendGroups[indexSendingPost].url}/`)

            setTimeout(
                function() {
                    const jsCode = `
                            
                    async function sendPost() {                        
                        try {
                            // Intentar cerrar el pop-up "Not now"
                            const notNowButton = document.querySelector('div[aria-label="Not now"]');
                            if (notNowButton) {
                                notNowButton.children[0].click();
                            }
                        } catch (e) {
                            const jsonString = JSON.stringify({
                                key: 'log',
                                value: e.toString()
                            });
                            window.ReactNativeWebView.postMessage(jsonString);
                        }

                        try {
                            const containsWriteSomething = document.body.innerHTML.includes('Write something...').toString();

                            if (containsWriteSomething === 'true') {
                                const targetDivs = document.querySelectorAll('div[data-mcomponent="MContainer"]');

                                for (let i = 0; i < targetDivs.length; i++) {
                                    const div = targetDivs[i];

                                    if (div.innerHTML.includes('Write something...')) {
                                        div.click();

                                        setTimeout(function() {
                                            const textDiv = document.querySelector('div[aria-label="Write something"]');
                                            if (textDiv) {
                                                textDiv.click();

                                                const textarea = document.querySelector('textarea');
                                                if (textarea) {
                                                    textarea.value = "${postUrl}";
                                                    textarea.dispatchEvent(new Event('input', { bubbles: true }));

                                                    const scrollable = document.querySelector('div[data-is-h-scrollable="true"]');
                                                    if (scrollable && scrollable.children.length > 0) {
                                                        scrollable.children[0].click();
                                                        
                                                        setTimeout(function() {
                                                            const btn = document.querySelector('div[aria-label="POST"]');
                                                            if (btn) {
                                                                btn.click();
                                                            }
                                                        }, 2000);
                                                    }
                                                }
                                            }
                                        }, 2000);
                                    } else if (div.innerHTML.includes('What are you selling?')) {
                                        // Lógica para manejar esta condición si es necesario
                                    }
                                }
                            }
                        } catch (e) {                         
                            const jsonString = JSON.stringify({
                                key: 'log',
                                value: e.toString()
                            });
                            window.ReactNativeWebView.postMessage(jsonString);
                        }

                        
                        setTimeout(function() {
                            const jsonString = JSON.stringify({
                                key: 'sendPost',
                                value: ${indexSendingPost}
                            });
                            window.ReactNativeWebView.postMessage(jsonString);
                        }, 6000);
                    }

                        
                    
                    (function() {
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', function() {
                                sendPost()
                            });
                        } else {
                            sendPost()
                        }
                    })();            
                    true;`;
                    webviewRef?.current.injectJavaScript(jsCode);
            }, 2000);
            
            await new Promise(resolve => setTimeout(resolve, 4000)); 
        }
        
        send();
        
    };

    const sendPostOld = async () => {
        async function send() { 
            setUrl(`https://facebook.com/groups/7592195638/`);
    
            setTimeout(function() {
                const jsCode = `
                async function getGroupsData() { 
                    const url = 'https://www.facebook.com/api/graphql/';
                    
                    const data = {
                        av: '61560497301814',
                        __aaid: '0',
                        __user: '61560497301814',
                        __a: '1',
                        __req: '14',
                        __hs: '19960.HYP:comet_pkg.2.1..2.1',
                        dpr: '1',
                        __ccg: 'EXCELLENT',
                        __rev: '1015957941',
                        __s: 'xkupm4:ii0lsm:4kkswq',
                        __hsi: '7407096570085532803',
                        __dyn: '7AzHK4HwkEng5K8G6EjBAg5S3G2O5U4e2C17xt3odE98K360CEboG0x8bo6u3y4o2Gwn82nwb-q7oc81xoswMwto886C11wBz83WwgEcEhwGxu782lwv89kbxS1Fwc61awkovwRwlE-U2exi4UaEW2G1jwUBwJK14xm3y11xfxmu2u5Ee88o4Wm7-2K0-obXCwLyESE2KwwwOg2cwMwhEkxebwHwNxe6Uak0zU8oC1hxB0qo4e16wWwjHBU-4EdrxG1fBG2-2K',
                        __csr: 'g8A4BNQ54kIfN4W5ijEvpa5Pi8AQIx0zrkqz-z-zaDdikR4qT8KycZTcy9liZ4TGQWmRYBApaq-imWOqjFnOQldaby8DB_BQiHG8nG8CiLGAmeGBO6LqBKum-9GcUZeFpFWBGaGHUSiqXmUkyEWVqG8xmmEGqUC4UmjgmCCx658rixfhoy6poOUqwzyob888gz8WVEmy8C3ii9x6dCDzod8rxa2i2KaGewYyUcUO1hyEdoG0zo5e1AwhU727Ef88E148C9wcq2K3y04UU11U2Nwte1rwsiw2J801jpk0qYzy4aCg15k0pW08vw2NE08684a0qa3m04Q80chU07wi1-wTw4UDw-w7tw-wfm',
                        __comet_req: '15',
                        fb_dtsg: 'NAcOPDzCC5D-fPDRUgC_YiSiZvewj16ZrzotTEvBn_bA8xHC6hhM21Q:38:1724598982',
                        jazoest: '25442',
                        lsd: '3K9URMsvKGHXVZ--MCtcxI',
                        __spin_r: '1015957941',
                        __spin_b: 'trunk',
                        __spin_t: '1724599062',
                        fb_api_caller_class: 'RelayModern',
                        fb_api_req_friendly_name: 'ComposerStoryCreateMutation',
                        variables: JSON.stringify({
                            "input": {
                                "composer_entry_point": "inline_composer",
                                "composer_source_surface": "group",
                                "composer_type": "group",
                                "logging": {
                                    "composer_session_id": "68404f79-d2af-473a-b987-a7e93e2ebdcb"
                                },
                                "source": "WWW",
                                "message": {
                                    "ranges": [],
                                    "text": "https://www.facebook.com/share/p/PRoJDcaECBn14tx2/"
                                },
                                "with_tags_ids": null,
                                "inline_activities": [],
                                "explicit_place_id": "0",
                                "text_format_preset_id": "0",
                                "attachments": [{
                                    "link": {
                                        "share_scrape_data": "{\"share_type\":37,\"share_params\":[1194324868507859]}"
                                    }
                                }],
                                "navigation_data": {
                                    "attribution_id_v2": "CometGroupDiscussionRoot.react,comet.group,via_cold_start,1724599066992,404784,2361831622,,"
                                },
                                "tracking": [null],
                                "event_share_metadata": {
                                    "surface": "newsfeed"
                                },
                                "audience": {
                                    "to_id": "7592195638"
                                },
                                "actor_id": "61560497301814",
                                "client_mutation_id": "1"
                            },
                            "feedLocation": "GROUP",
                            "feedbackSource": 0,
                            "focusCommentID": null,
                            "gridMediaWidth": null,
                            "groupID": null,
                            "scale": 1,
                            "privacySelectorRenderLocation": "COMET_STREAM",
                            "checkPhotosToReelsUpsellEligibility": false,
                            "renderLocation": "group",
                            "useDefaultActor": false,
                            "inviteShortLinkKey": null,
                            "isFeed": false,
                            "isFundraiser": false,
                            "isFunFactPost": false,
                            "isGroup": true,
                            "isEvent": false,
                            "isTimeline": false,
                            "isSocialLearning": false,
                            "isPageNewsFeed": false,
                            "isProfileReviews": false,
                            "isWorkSharedDraft": false,
                            "hashtag": null,
                            "canUserManageOffers": false,
                            "__relay_internal__pv__CometUFIShareActionMigrationrelayprovider": true,
                            "__relay_internal__pv__IncludeCommentWithAttachmentrelayprovider": true,
                            "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
                            "__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider": false,
                            "__relay_internal__pv__IsWorkUserrelayprovider": false,
                            "__relay_internal__pv__IsMergQAPollsrelayprovider": false,
                            "__relay_internal__pv__StoriesArmadilloReplyEnabledrelayprovider": true,
                            "__relay_internal__pv__EventCometCardImage_prefetchEventImagerelayprovider": false
                        }),
                        server_timestamps: 'true',
                        doc_id: '7703046043138503'
                    };
    
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams(data).toString()
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response;
                    })
                    .then(data => {
                        const jsonString = JSON.stringify({
                            key: 'log',
                            value: data
                        });
                        window.ReactNativeWebView.postMessage(jsonString);
                    })
                    .catch(error => {
                        alert('There was a problem with the fetch operation: ' + error.toString());
                    });
    
                }
                    
                getGroupsData();
        
                true;`;
                webviewRef?.current.injectJavaScript(jsCode);
            }, 2000);
            
            await new Promise(resolve => setTimeout(resolve, 4000)); 
        }
        
        send();
    };
    

    const getGroups = () => {
        const jsCode = `
        async function getGroupsData() { 
            //await new Promise(resolve => setTimeout(resolve, 2000)); 
            //document.querySelector('div[role="list"]').style.transform = 'scale(0.3)';

            if(document.body.innerHTML.includes("You’re Temporarily Blocked")) {                
                const jsonString = JSON.stringify({
                    key: 'getGroups2',
                });
                window.ReactNativeWebView.postMessage(jsonString);
            }else{
            
                const listitems = document.querySelector('div[role="list"]').querySelectorAll('div[role="listitem"]');
                
                const dataGroups = [];
                
                for (let i = 0; i < listitems.length; i++) {
                    try {
                    
                        const item = listitems[i];
                        const image = item.querySelector('image');                
                        const text = item.querySelector('a[role="link"]');
                        dataGroups.push({
                            name:text.querySelector('svg[aria-label]').getAttribute('aria-label'),
                            img:image.getAttributeNS('http://www.w3.org/1999/xlink', 'href').toString(),                    
                            url: text.href.replace('https://www.facebook.com/groups/', ''),
                            select: false
                        });
                    
                    } catch (error) {
                    }

                };            
                const jsonString = JSON.stringify({
                    key: 'groups',
                    value: dataGroups
                });
                window.ReactNativeWebView.postMessage(jsonString);
            }
        }
            
                
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        meta.setAttribute('content', 'width=device-width, initial-scale=0.01, maximum-scale=0.01, user-scalable=no');
        document.getElementsByTagName('head')[0].appendChild(meta);
        
            
        (function() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    const jsonString = JSON.stringify({
                        key: 'loadingGroups',
                        value: true
                    });
                    window.ReactNativeWebView.postMessage(jsonString);
                    getGroupsData();
                });
            } else {
                const jsonString = JSON.stringify({
                    key: 'loadingGroups',
                    value: true
                });
                window.ReactNativeWebView.postMessage(jsonString);                                   
                getGroupsData();
            }
        })();
        true;`;
        webviewRef?.current.injectJavaScript(jsCode);
        
    };
    
    const getGroups2 = () => {
        const jsCode = `
        async function getGroupsData() { 
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            await new Promise(resolve => setTimeout(resolve, 1000)); 


            const images = document.querySelectorAll('img');
            const namesDiv = document.querySelectorAll('div[data-mcomponent="ServerTextArea"]');
            const names = Array.from(document.querySelectorAll('div[data-type="text"]'))
            .slice(25)
            .filter(item => item.innerText.trim() !== '...' && item.innerText.trim() !== '');
            
            
            const dataGroups = [];

            try {
                const ids = []
                for (let i = 0; i < names.length; i+=2) {
                    const n = names[i]
                    
                    const jsonString = JSON.stringify({
                        key: 'groupGetData',
                        value: {
                            name:n.innerText,
                            img:images[i/2].src,
                            url: "",
                            select: false
                        }
                    });
                    window.ReactNativeWebView.postMessage(jsonString);

                    n.click();
                    await new Promise(resolve => setTimeout(resolve, 3000)); 

                    const div = document.querySelector('div[data-successful-render-id]');
                    if (div != null) {
                        const id = div.getAttribute('data-successful-render-id');
                        if (!ids.includes(id)) {
                            ids.push(id);
                        }
                    }
                };
                
                let i = 0;
                images.forEach((img) => {
                    dataGroups.push({
                        name:names[i].innerText,
                        img:img.src,
                        url: ids[i/2],
                        select: false
                    });
                    i += 2
                });
            }catch (error) {}
            
            const jsonString = JSON.stringify({
                key: 'groups',
                value: dataGroups
            });
            window.ReactNativeWebView.postMessage(jsonString);
        }
            
        (function() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {

                    //document.body.style.transform = 'scale(0.5)';
                    //document.body.style.transformOrigin = '0 0';

                    setTimeout(function() {
                        const jsonString = JSON.stringify({
                            key: 'loadingGroups',
                            value: true
                        });
                        window.ReactNativeWebView.postMessage(jsonString);
                        
                        const div = document.querySelector('div[aria-label="Facebook Menu"]');
                        const childDivs = div.querySelectorAll('div');
                        childDivs[0].click();

                        const groupsBtn = document.querySelector('div[data-comp-id="3"]');
                        groupsBtn.click();

                        setTimeout(function() {
                            const yourGroupsBtn = document.querySelector('div[aria-label="Your groups"]');
                            yourGroupsBtn.click();
                        
                            getGroupsData()

                        }, 2000);
                    }, 2000);
                });
            } else {        
                //document.body.style.transform = 'scale(0.005)';
                //document.body.style.transformOrigin = '0 0';
                //document.body.style.width = '2000%';   

                setTimeout(function() {
                    const jsonString = JSON.stringify({
                        key: 'loadingGroups',
                        value: true
                    });
                    window.ReactNativeWebView.postMessage(jsonString);
                    
                    const div = document.querySelector('div[aria-label="Facebook Menu"]');
                    const childDivs = div.querySelectorAll('div');
                    childDivs[0].click();

                    const groupsBtn = document.querySelector('div[data-comp-id="3"]');
                    groupsBtn.click();

                    setTimeout(function() {
                        const yourGroupsBtn = document.querySelector('div[aria-label="Your groups"]');
                        yourGroupsBtn.click();
                    
                        getGroupsData()

                    }, 2000);
                }, 2000);
            }
        })();
        true;`;
        webviewRef?.current.injectJavaScript(jsCode);
        
    };
    
    const getDataPost = () => {
        const jsCode = `
        async function getDataPost() { 
            await new Promise(resolve => setTimeout(resolve, 2000)); 


            try {
                const images = Array.from(document.querySelectorAll('img')).filter(img => !img.src.includes('https://static.'));
                
                const video = document.querySelectorAll('video');
                const texts = document.querySelectorAll('span');


                if(video){
                    const jsonString = JSON.stringify({
                        key: 'dataPost',
                        value: {
                            img:images[0].src.toString(),
                            images:[images[1].src.toString(),],

                            name:texts[7].innerText,
                            date:texts[9].innerText,
                            text:"",
                        }
                    });
                    window.ReactNativeWebView.postMessage(jsonString);
                }
                else{
                    const jsonString = JSON.stringify({
                        key: 'dataPost',
                        value: {
                            img:images[0].src.toString(),
                            images:[images[1].src.toString(),],

                            name:texts[2].innerText.toString(),
                            date:texts[3].innerText.toString().replace("󰞋󱟠",""),
                            text:"",
                        }
                    });
                    window.ReactNativeWebView.postMessage(jsonString);
                }


            }catch (error) {
                const t = JSON.stringify({
                        key: 'log',
                        value: error.toString()
                    });
                window.ReactNativeWebView.postMessage(t);
            }
        }
            
        getDataPost()
        .then((ids) => {
            console.log("IDs obtenidos:", ids);
        });
        true;`;
        webviewRef?.current.injectJavaScript(jsCode);
        
    };

    return (
        <SafeAreaView className="h-full flex flex-col">
            <WebView
                className={`h-full h-full ${Platform.OS === 'android' && "mt-12"}`}
                ref={webviewRef}
                source={{ 
                    uri: url,
                    headers: {
                      'Accept-Language': 'en',
                    },
                }}
                userAgent= {url === 'https://www.facebook.com/groups/joins/?nav_source=tab&ordering=viewer_added'?"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36":""}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={false}

                onNavigationStateChange={(webViewState) => {
                    if(postUrl && !dataPost && postUrl.includes('share')) setPostUrl(webViewState.url);
                }}
                onLoadStart={() => {
                    setIsWebViewLoading(true)
                }}
                onLoadEnd={() => {
                    setIsWebViewLoading(false)
                    searchLoginRequired()
                    if(postUrl && !dataPost && !postUrl.includes('share')) getDataPost()
                }}
                originWhitelist={['*']}

                onMessage={(event) => {
                    const jsonString = event.nativeEvent.data;
                    try {
                        const data = JSON.parse(jsonString);
                        
                        if(data.key === 'log') {
                            console.log(data.value)
                        }
                        
                        if(data.key === 'login') {
                            if(data.value) setGroups([]);
                            setLoginRequired(data.value)
                        }
                        
                        if(data.key === 'loadingGroups') {
                            setLoadingGroups(data.value)
                        }
                        if(data.key === 'sendPost') {
                            const selectedSendGroups:Group[] = groups? Array.from(groups.filter(g => g.select === true)):[];
                            if(data.value + 1 < selectedSendGroups.length) {
                                sendPost(data.value  + 1);
                                setGroupPostingLoading(selectedSendGroups[data.value+1].url)
                            }
                            else {
                                setIsPosting(false)
                                setUrl('https://www.facebook.com/')
                                setGroupPostingLoading("")
                            }
                        }
                        if(data.key === 'groups') {
                            setGroups(data.value)
                            setLoadingGroups(false)
                        }
                        if(data.key === 'groupGetData') {
                            setGroupGetData(data.value)
                        }
                        
                        if(data.key === 'getGroups2'){                            
                            setLoadingGroups(true)

                            setUrl('https://www.facebook.com/');
                            setTimeout(function() {
                                    setGroups([])
                                    getGroups2();
                            }, 4000);
                        }
                        if(data.key === 'dataPost') {
                            setDataPost(data.value)
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }}
            />
            
            
            <ScrollView className={tabSelected !== "facebook"? `bg-white h-full w-full absolute z-50 mt-12 ${Platform.OS === 'android' && "mt-12"}`: "hidden"}>
                {
                    loadingGroups?
                    <View className="h-full flex flex-col items-center justify-center py-20" >
                        <ActivityIndicator size="large" color="gray" />
                        <Text className="text-md mt-1">Loading groups</Text>

                        
                        {   groupGetData &&
                            <View className="flex flex-col px-3 py-4 m-8 w-max bg-blue-100 shadow rounded-xl h-24" >
                                <Text className="text-md w-full font-bold">Getting data from:</Text>
                                <View className="h-full flex flex-row items-center justify-center w-full space-x-4 mb-1">
                                    <Image 
                                        source={{ uri: groupGetData.img }} 
                                        className="h-10 w-10 rounded-full"
                                    />
                                    <Text className="text-lg flex-1" numberOfLines={1}>{groupGetData.name}</Text>
                                </View>
                            </View>
                        }

                    </View>
                    :
                    
                    <View className="flex flex-col" 
                    
                    >
                        {
                            groups.length > 0 &&
                            <View className="flex flex-col bg-gray-100 m-2 rounded-xl" >
                                <View className="flex flex-row py-3 pl-5 pr-3 items-center justify-between space-x-4" >
                                    <Entypo name="link" size={20} color="black" />
                                    <Text className="text-sm font-semibold flex-1 truncate" numberOfLines={1}>{postUrl?postUrl:"Escriba el link a la publicacion" }</Text>
                                    { !isPosting && <TouchableOpacity
                                        className='bg-blue-200 p-2 rounded-xl flex flex-row items-center justify-between space-x-2'
                                        onPress={handlePaste}
                                    >
                                        <Octicons name="paste" size={20} color="#2563eb" />
                                        <Text className="text-sm font-semibold truncate text-blue-600">Paste</Text>
                                    </TouchableOpacity>}
                                </View>
                                {
                                    dataPost && 
                                    <View className="flex flex-col border-t-0.5" >
                                        <View className="flex flex-row px-4 py-2 mx-1" >
                                            <Image 
                                                source={{ uri: dataPost.img }} 
                                                className="h-12 w-12 rounded-full"
                                            />
                                            <View className="flex flex-col flex-1 items-center px-3" >
                                                <Text className="text-lg w-full font-semibold" numberOfLines={1}>{dataPost.name}</Text>
                                                <Text className="text-sm w-full font-light" numberOfLines={1}>{dataPost.date}</Text>
                                            </View>
                                        </View>
                                        <Image 
                                            source={{ uri: dataPost.images[0] }} 
                                            className="w-full h-72  rounded-b-xl"
                                        />
                                    </View>
                                }
                            </View>
                        }

                        {
                            postUrl && dataPost && 
                            
                            <Pressable
                            className="flex-1 bg-blue-500 p-4 m-2 rounded"                        
                            onPress={handleSendPost}>
                                <Text className="w-full text-center font-bold text-white">{isPosting?"Sending POSTS...":"POST"}</Text>
                            </Pressable>
                        }

                        {
                            groups.length > 0 && !isPosting &&
                            <View className="flex flex-row p-3 items-center justify-between" >
                                <Text className="text-lg font-bold">Your groups</Text>
                                <TouchableOpacity
                                    className='bg-gray-200 p-2 rounded-full'
                                    onPress={handlerPressReload}
                                >
                                    <Ionicons name="reload" size={20} color="black" />
                                </TouchableOpacity>
                            </View>
                        }
                        {
                            groups && groups.length > 0 && groups.map((group, index) => (
                            <View className={`flex flex-row items-center px-4 py-1 border-b-0.5 border-gray-300 space-x-3 ${isPosting && !Array.from(groups.filter(g => g.select === true)).includes(group) && "hidden"}`} key={index}>

                                <Image 
                                    source={{ uri: group.img }} 
                                    className="h-9 w-9 rounded-lg"
                                />
                                <Text className="text-md flex-1">{group.name}</Text>
                                { !isPosting && <Checkbox id={group.url} />}
                                { groupPostingLoading === group.url &&  <ActivityIndicator size="small" color="gray" />}
                            </View>
                        ))}
                    </View>
                }
                <View className="w-full h-72" >
                </View>
            </ScrollView>
            
            <View className="flex flex-row p-1 items-center justify-between border-t-0.5 mt-2 z-50 bg-white" >
                <BtnTab onPress={handlerPressFace} isSelected={tabSelected === "facebook"} text="Facebook"/>
                <BtnTab onPress={handlerPressMultipost} isSelected={tabSelected === "mp"} text="MultiPost"/>
            </View>
        </SafeAreaView>
    );
}
