function NespectiveEMSFeedbackWidgetInteraction($options) {

    this.$widgetOptions = $options || {};

    var $nefwi = this;

    var files;

    this.feedbackWidgetEnable = ($options.feedbackWidgetEnable === false) ? false : true;

    this.version = "0.1.8";
 
    this.BASE_URL = 'https://ems.netspective.com/';

    //End point
    this.END_POINT = this.BASE_URL + 'api/feedback.json';
    //File end point
    this.FILE_END_POINT = this.BASE_URL + 'api/import/file.json';
    //CAPTCHA Image end point
    this.SECURIMAGE_END_POINT = this.BASE_URL + 'api/secure-image';

    //widget Params
    this.params = {
        mainId: "feedbackWidgetModal",
        mainClass: "feedback-widget-modal",
        mainClassContainer: "feedback-modal-container",
        feedbackOverlayClass: "feedback-backdrop",
        labeClass: "feedbackLabel",
        feedbackBody: "feedback-body",
        formId: "insertFeedbackForm",
        formClass: "insertFeedbackForm",
        formName: "insertFeedbackForm",
        submitButtonId: "postFeedback",
        captchaTextId: "captchaCode",
        feedbackTypeTextName: "FeedbackType",
        feedbackTypeId: "feedbackType",
        feedbackUserTextName: "FeedbackUser",
        feedbackUserTextId: "FeedbackUser",
        feedbackEmailTextName: "FeedbackUserEmail",
        feedbackEmailTextId: "FeedbackUserEmail",
        feedbackSubjectTextName: "FeedbackSubject",
        feedbackSubjectId: "feedbackSubject",
        feedbackDescriptionTextName: "FeedbackDesc",
        feedbackDescriptionId: "feedbackDesc",
        captchaImage: "captchaImage",
        changeCaptchaImageId: "changeCaptchaImage",
        changeCaptchaImageText: "<div class='refresh-icon'></div>",
        attachmentText: "Attachment",
        attachmentTextName: "feedbackAttachment",
        attachmentClassName: "feedback-attachment",
        attachmentTextId: "feedbackAttachmentId",
        attachmentMaxAllowedSize: 2097152,
        validAttachmentExtensions: ["txt", "jpg", "jpeg", "gif", "png", "ico", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "rar", "pdf"],
        captureImageTextId: "captureImg",
        captchaImageId: "CaptchaId",
        captureImageTextName: "Screenshot",
        screenCaptureResolutionLimit: 768,
        captchaTextId: "captchaCode",
        captchaTextName: "CaptchaCode",
        userPlaceholder: "Enter Your Name",
        emailPlaceholder: "Enter Your Email ID",
        subjectPlaceholder: "Enter Subject",
        descriptionPlaceholder: "Enter Description",
        captchTextPlaceholder: "Enter Captcha",
        successMessage: "Message send successfully."
    };

    //Default Options
    this.$defaults = {
        feedbackCaptchaEnable: true, // captcha enable/disable boolean
        feedbackCaptureWebPageEnable: true,// webpage screen shot enable/disable boolean
        feedbackLabelPosition: 'centerLeft', // Label position
        feedbackTitle: 'Support & Feedback', // title string;
        feedbackTitleCSS: {
            backgroundColor: "#840C08",
            color: "#FFFFFF",
            fontSize: "15"
        },
        feedbackTypes: [
            "Report A Problem",
            "Request a Feature",
            "Ask A Question",
            "Give Praise",
            "Share An Idea"
        ],
        feedbackFormTitle: "Netspective EMS Support Form",
        feedbackWidgetIcon: '',
        feedbackWidgetLabelIcon: '',
        // z-index for the blocking overlay
        baseZ: 1000
    };

    this.userDefaultData = {
        name: '',
        email: ''
    };

    /**
     * To initialize EMS Feedback Widget
     * @params string  apiKey
     */
    this.register = function(apiKey, releaseStage) {
        this.apiKey = apiKey;
        this.releaseStage = releaseStage;
        if (this.apiKey) {
            $nefwi.init();
        }
    };

    /**
     * To get user data
     * @params function  callback
     */
    this.getUserSessionData = function(callback) {
        if (typeof callback == 'function') {
            $nefwi.userData = callback();
        } else {
            $nefwi.userData = callback;
        }
    };

    /******** Our intialization function ********/
    this.init = function() {
        if ($nefwi.feedbackWidgetEnable) {
            // Localize jQuery variable
            var jQuery;

            if (window.jQuery === undefined) {
                var script_tag = document.createElement('script');
                script_tag.setAttribute("type", "text/javascript");
                script_tag.setAttribute("src",
                    $nefwi.BASE_URL + "app/lib/jquery/jquery-1.7.2.min.js");
                if (script_tag.readyState) {
                    script_tag.onreadystatechange = function() { // For old versions of IE
                        if (this.readyState == 'complete' || this.readyState == 'loaded') {
                            $nefwi.loadScriptHandler();
                        }
                    };
                } else { // Other browsers
                    script_tag.onload = $nefwi.loadScriptHandler;
                }
                // Try to find the head, otherwise default to the documentElement
                (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
            } else {
                // The jQuery version on the window is the one we want to use
                jQuery = window.jQuery;
                $nefwi.main();
            }
        }
    };

    /******** Called once jQuery has loaded ******/
    this.loadScriptHandler = function() {
        // Restore $ and window.jQuery to their previous values and store the
        // new jQuery in our local jQuery variable
        jQuery = window.jQuery.noConflict(true);
        // Call our main function
        $nefwi.main();
    };

    /******** Main function ********/
    this.main = function() {

        jQuery(document).ready(function($) {

            $nefwi.options = jQuery.extend({}, $nefwi.$defaults, $nefwi.$widgetOptions);

            $nefwi.userSessionData = $.extend({}, $nefwi.userDefaultData, $nefwi.userData);
            /******* LOAD WIDGET CSS *******/
            var widgetCSS = $("<link>", {
                rel: "stylesheet",
                type: "text/css",
                href: $nefwi.BASE_URL + "app/css/netspective-feedback-widget.css"
            });
            widgetCSS.appendTo('head');



            if (window.plupload === undefined) {
                /*** LOAD PLUPLOAD.FULL.MIN.JS ***/
                var jQueryPluploadJs = document.createElement('script');
                jQueryPluploadJs.setAttribute("type", "text/javascript");
                jQueryPluploadJs.setAttribute("src",
                    $nefwi.BASE_URL + "app/lib/plugins/plupload/plupload.full.min.js");
                document.getElementsByTagName('head')[0].appendChild(jQueryPluploadJs);
            }



            /*** LOAD JQUERY.VALIDATE JS ***/
            var validateJs = document.createElement('script');
            validateJs.setAttribute("type", "text/javascript");
            validateJs.setAttribute("src",
                $nefwi.BASE_URL + "app/lib/plugins/validation/jquery.validate.min.js");
            document.getElementsByTagName('head')[0].appendChild(validateJs);



            if (window.html2canvas === undefined) {
                /*** LOAD HTML2CANVAS JS ***/
                var html2canvasJs = document.createElement('script');
                html2canvasJs.setAttribute("type", "text/javascript");
                html2canvasJs.setAttribute("src",
                    $nefwi.BASE_URL + "app/lib/plugins/html2canvas/html2canvas.js");
                document.getElementsByTagName('head')[0].appendChild(html2canvasJs);
            }

            /*** LOAD JQUERY.PLACEHOLDER JS ***/
            var jQueryplaceHolder = document.createElement('script');
            jQueryplaceHolder.setAttribute("type", "text/javascript");
            jQueryplaceHolder.setAttribute("src",
                $nefwi.BASE_URL + "app/lib/plugins/placeholder/jquery.placeholder.js");
            document.getElementsByTagName('head')[0].appendChild(jQueryplaceHolder);

            /*
             *Function to convert serialized array to json object
             */
            $.fn.serializeObject = function() {
                var o = {};
                var a = this.serializeArray();
                jQuery.each(a, function() {
                    if (o[this.name] !== undefined) {
                        if (!o[this.name].push) {
                            o[this.name] = [o[this.name]];
                        }
                        o[this.name].push(this.value || '');
                    } else {
                        o[this.name] = this.value || '';
                    }
                });
                return o;
            };

            //Setting options
            $nefwi.setLabelOptions($nefwi.options);

            jQuery(document).click(function(e) {
                if (!jQuery(e.target).is('#' + $nefwi.params.formId + ', #' + $nefwi.params.formId + ' *')) {
                    //alert('hide');
                    jQuery('.feedback-backdrop,#feedbackWidgetModal').hide();
                    jQuery('body').removeClass('feedback-modal-open');
                }
            });
            jQuery('.' + $nefwi.params.labeClass).unbind('click').bind('click', function(event) {
                event.stopPropagation();

                jQuery('body' + $nefwi.params.mainId).remove();

                jQuery('#' + $nefwi.params.mainId).remove();

                jQuery('.' + $nefwi.params.feedbackOverlayClass).remove();

                var randomCaptchaId = Math.random().toString(36).slice(2).substring(1);

                var loadCaptchaImage = '',
                    userBlock;

                if ($nefwi.options.feedbackCaptchaEnable) {
                    loadCaptchaImage = '' +
                        '<div class="feedback-form-group">' +
                        '<div class="col coloffset-25 col-75 ">' +
                        '<img id="' + $nefwi.params.captchaImage + '"  data-html2canvas-ignore="true" src="' + $nefwi.SECURIMAGE_END_POINT + '?captchaId=' + randomCaptchaId + '" alt="CAPTCHA Image" />' +
                        '<a  href="javascript:void(0);" id="' + $nefwi.params.changeCaptchaImageId + '" class="refresh-block capitalize-text btn btn-info">' + $nefwi.params.changeCaptchaImageText + '</a><br/>' +
                        '<input  type="hidden" name="' + $nefwi.params.captchaImageId + '" id="' + $nefwi.params.captchaImageId + '" value="' + randomCaptchaId + '" />' +
                        '</div>' +
                        '</div>' +
                        '<div class="feedback-form-group">' +
                        '<div class="col coloffset-25 col-75">' +
                        '<input type="text" required placeholder="' + $nefwi.params.captchTextPlaceholder + '" class="form-control input-width-large" name="' + $nefwi.params.captchaTextName + '" id="' + $nefwi.params.captchaTextId + '">' +
                        '</div>' +
                        '</div>';
                }
                if ($nefwi.userSessionData.name != "" || $nefwi.userSessionData.email != "") {
                    userBlock = '' +
                        '<div class="feedback-form-group">' +
                        '<div class="col col-100 ">';
                    if ($nefwi.userSessionData.name) {
                        userBlock += 'Welcome, <span class="capitalize-text">' + $nefwi.userSessionData.name + '</span><input  type="hidden" name="' + $nefwi.params.feedbackUserTextName + '" id="' + $nefwi.params.feedbackUserTextId + '" value="' + $nefwi.userSessionData.name + '" />';
                    } else {
                        if ($nefwi.userSessionData.email) {
                            userBlock += 'Welcome, <span class="capitalize-text">' + $nefwi.userSessionData.email.replace(/^(.+)@(.+)$/g, '$1') + '</span><input  type="hidden" name="' + $nefwi.params.feedbackUserTextName + '" id="' + $nefwi.params.feedbackUserTextId + '" value="' + $nefwi.userSessionData.email.replace(/^(.+)@(.+)$/g, '$1') + '" />';
                        }
                    }
                    if ($nefwi.userSessionData.email) {
                        userBlock += '<input  type="hidden" name="' + $nefwi.params.feedbackEmailTextName + '" id="' + $nefwi.params.feedbackEmailTextId + '" value="' + $nefwi.userSessionData.email + '" />';
                    }
                    userBlock += '</div>' +
                        '</div>';
                } else {
                    userBlock = '' +
                        '<div class="feedback-form-group">' +
                        '<label class="col  control-label">Name: <font color="red">*</font></label>' +
                        '<div class="col col-75">' +
                        '<input type="text"  name="' + $nefwi.params.feedbackUserTextName + '" id="' + $nefwi.params.feedbackUserTextId + '" placeholder="' + $nefwi.params.userPlaceholder + '" class="form-control input-width-large required">' +
                        '</div>' +
                        '</div>' +
                        '<div class="feedback-form-group">' +
                        '<label class="col  control-label">Email: <font color="red">*</font></label>' +
                        '<div class="col col-75">' +
                        '<input type="text" required data-validation="email" name="' + $nefwi.params.feedbackEmailTextName + '" id="' + $nefwi.params.feedbackEmailTextId + '" placeholder="' + $nefwi.params.emailPlaceholder + '" class="form-control input-width-large  email required">' +
                        '</div>' +
                        '</div>';
                }

                var feedbackType = '',
                    newOption = '';
                jQuery.each($nefwi.options.feedbackTypes, function(i, item) {
                    feedbackType += "<option value='" + item + "'>" + item + "</option>";
                });

               var $html = '' +
                    '<div class="fade ' + $nefwi.params.mainClass + '" data-html2canvas-ignore="" id="' + $nefwi.params.mainId + '" >' +
                    '<div class="' + $nefwi.params.mainClassContainer + '">' +
                    '<form data-parsley-validate name="' + $nefwi.params.formName + '" id="' + $nefwi.params.formId + '" method="POST" class="feedback-form"   enctype="multipart/form-data">' +
                    '<div class="feedback-modal-content">' +
                    '<div class="fade-block"></div>' +
                    '<div class="loader-pleasewait"></div>' +
                    '<div class="feedback-modal-header">' +
                    '<a class="feedback-close" ><button onClick="return false;" class="close-icon"></button></a>' +
                    '<h4 class="feedback-modal-title">' + $nefwi.options.feedbackFormTitle + '</h4>' +
                    '</div>' +
                    '<div class="feedback-modal-body ' + $nefwi.params.feedbackBody + '">   ' +
                    userBlock +
                    '<div class="feedback-form-group">' +
                    '<label class="col  control-label">Support Type: <font color="red">*</font></label>' +
                    '<div class="col col-75">' +
                    '<select  required name="' + $nefwi.params.feedbackTypeTextName + '" id="' + $nefwi.params.feedbackTypeId + '" class="form-control input-width-large">' +
                    '<option value="" selected="">-Select Type-</option>' + feedbackType +
                    '</select>' +
                    '</div>' +
                    '</div>' +
                    '<div class="feedback-form-group">' +
                    '<label class="col  control-label">Subject: <font color="red">*</font></label>' +
                    '<div class="col col-75">' +
                    '<input type="text" required name="' + $nefwi.params.feedbackSubjectTextName + '" id="' + $nefwi.params.feedbackSubjectId + '" placeholder="' + $nefwi.params.subjectPlaceholder + '" class="form-control input-width-large">' +
                    '</div>' +
                    '</div>' +
                    '<div class="feedback-form-group">' +
                    '<label class="col  control-label">Description: <font color="red">*</font></label>' +
                    '<div class="col col-75">' +
                    '<textarea required rows="3" cols="5" name="' + $nefwi.params.feedbackDescriptionTextName + '" id="' + $nefwi.params.feedbackDescriptionId + '" placeholder="' + $nefwi.params.descriptionPlaceholder + '" class="form-control"></textarea>' +
                    '</div>' +
                    '</div>' +
                    '<div>' +
                    '<label class="col  control-label"></label>' +
                    '<div class="feedback-form-group">' +
                    '<font size="2">(<font color="red">*</font>) denotes required fields</font>' +
                    '</div>' +

                loadCaptchaImage +

                '<div class="feedback-form-group">' +
                    '<div class="col coloffset-25 col-75"> ' +
                    '<div class="fileinput fLeft prelative">' +
                    '<input type="hidden" value="" >' +
                    '<div class=" btn btn-info btn-sm btn-file">' +
                    '<div class="fileinput-new" id="pickfiles" target="_self">' +
                    '<div class="clip-icon">' + $nefwi.params.attachmentText + '</div>' +
                    '</div>' +
                    '<div class="fileinput-exists">' +
                    '<div class="clip-icon"> Remove Attachment</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="fileinput-filename"></div>' +
                    '<a style="float: none"  class="fileinput-exists close-icon" href="javascript:void(0);"></a>' +
                    '</div> ' +
                    '<input type="hidden"  class="' + $nefwi.params.attachmentClassName + '" name="' + $nefwi.params.attachmentTextName + '" id="' + $nefwi.params.attachmentTextId + '">' +
                    '</div>' +
                    '</div>' +
                    '<div class="feedback-form-group">' +
                    '<div class="col coloffset-25 col-75 ">' +
                    '<div class="feedback_thumb_image fLeft" data-href="javascript:void(0);" ></div> ' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="feedback-modal-footer">' +
                    '<button type="button" class="btn btn-default close-btn"   data-dismiss="modal">Close</button> ' +
                    '<button type="button" class="btn btn-primary" id="' + $nefwi.params.submitButtonId + '" >Submit</button> ' +
                    '</div>' +
                    '</div>' +
                    '</form>' +
                    '</div>' +
                    '</div> ' +
                    '<div class="' + $nefwi.params.feedbackOverlayClass + '" data-html2canvas-ignore=""></div>';
                jQuery('body').append($html);

                jQuery('#' + $nefwi.params.mainId + ' input,#' + $nefwi.params.mainId + ' textarea').placeholder();

                $nefwi.uploader = new plupload.Uploader({
                    // runtimes: 'silverlight,html4',
                    browse_button: 'pickfiles', // you can pass in id...
                    url: '*',
                    chunk_size: '1mb',
                    multi_selection: false,
                    unique_names: true
                });
                $nefwi.uploader.bind('QueueChanged', function(up) {
                    var files = this.files;
                    if (files.length > 0) {
                        if ($nefwi.validateAttachment(files[files.length - 1])) {
                            $nefwi.files = files[files.length - 1];
                        }
                        if (files.length > 0) {
                            jQuery('.fileinput-new').hide();
                            jQuery('.fileinput-exists').show();
                        } else {
                            jQuery('.fileinput-new').show();
                            jQuery('.fileinput-exists').hide();
                        }
                        jQuery('.fileinput-filename').html(files[files.length - 1].name);
                    }
                });


                $nefwi.uploader.init();

                if ($nefwi.options.feedbackWidgetIcon) {
                    jQuery('#' + $nefwi.params.mainId).find('.feedback-modal-header').prepend(
                        jQuery('<img />').attr({
                            'src': $nefwi.options.feedbackWidgetIcon,
                            'alt': '',
                            'class': 'widgetIcon',
                            'height': '30'
                        }).css('height', '30px')
                    );

                }
                jQuery('.' + $nefwi.params.mainClass).fadeIn('fast');

                jQuery('.' + $nefwi.params.mainClass).addClass('in');

                if (jQuery(document).height() >= jQuery('#' + $nefwi.params.mainClassContainer).height()) {
                    jQuery('body').addClass('feedback-modal-open');
                }

                setTimeout(function() {
                    if (jQuery("body").hasClass("feedback-modal-open") === false && jQuery(document).height() >= jQuery('#' + $nefwi.params.mainClassContainer).height()) {
                        jQuery("body").css('overflow', 'hidden');
                    }
                    if(typeof($nefwi.options.feedbackCaptureWebPageEnable)!= 'undefined' ){
                        if($nefwi.options.feedbackCaptureWebPageEnable){
                              $nefwi.captureWebPage(); 
                        }
                    }else if($nefwi.$defaults.feedbackCaptureWebPageEnable){
                        $nefwi.captureWebPage(); 
                    }
                }, 0);

            });

            jQuery('body').delegate('a.fileinput-exists, .fileinput .btn-file .fileinput-exists', "click", function() {
                jQuery('#' + $nefwi.params.attachmentTextId).context.value = '';
                jQuery('.fileinput-new').show();
                jQuery('.fileinput-exists').hide();
                jQuery('.fileinput-filename').html('');
                jQuery('label[for=' + $nefwi.params.attachmentTextId + ']').remove();
                jQuery('.error-block').remove();
                jQuery("#" + $nefwi.params.attachmentTextId).val('');
                $nefwi.files = '';
                if ($nefwi.uploader!=undefined) {
                	jQuery.each($nefwi.uploader.files, function(i, file) {
                    		$nefwi.uploader.removeFile(file);
                	});
                };
            });

            jQuery('body').delegate('a.feedback-close, button.close-btn', "click", function() {
                $nefwi.files = '';
                if ($nefwi.uploader!=undefined) {
                	jQuery.each($nefwi.uploader.files, function(i, file) {
                    		$nefwi.uploader.removeFile(file);
                	});
                };
                jQuery(this).closest('#' + $nefwi.params.mainId).remove();
                jQuery('.' + $nefwi.params.feedbackOverlayClass).remove();
                jQuery('body').removeClass('feedback-modal-open');
                jQuery("body").css('overflow', '');
            });

            jQuery('body').delegate('.feedback-modal-body button.feedback-close', "click", function(event) {
                jQuery(this).parent().remove();
                event.stopPropagation();
            });

            jQuery('body').delegate('#' + $nefwi.params.changeCaptchaImageId, "click", function() {
                var randomCaptchaId = Math.random().toString(36).slice(2).substring(1);
                jQuery('#' + $nefwi.params.captchaImageId).val(this.randomCaptchaId);
                jQuery('#' + $nefwi.params.captchaImage).attr('src', $nefwi.SECURIMAGE_END_POINT + '?captchaId=' + randomCaptchaId);
            });

            jQuery('body').delegate('#' + $nefwi.params.submitButtonId, "click", function() {
                $nefwi.postFeedback();
            });
        });
    };


    /******** FETCH DATA ********/
    this.validateAttachment = function(files) {

        var convertSize = ($nefwi.params.attachmentMaxAllowedSize / 1048576).toFixed(0);

        var message = "",
            result;
        var fileName = files.name
        var fileExtension = fileName.split('.')[fileName.split('.').length - 1].toLowerCase();

        if (jQuery.inArray(fileExtension, $nefwi.params.validAttachmentExtensions) == -1) {
            message = "Please make sure your file is valid";
        } else {
            if (files.size > $nefwi.params.attachmentMaxAllowedSize) {
                message = "Please make sure your file size is less than " + convertSize + " MB";
            }
        }
        result = (files.size <= $nefwi.params.attachmentMaxAllowedSize && jQuery.inArray(fileExtension, $nefwi.params.validAttachmentExtensions) != -1);
        if (result === false) {
            jQuery('#' + $nefwi.params.attachmentTextId).parent().append('<div class="fLeft clr error-block"><label class="error">' + message + '</label></div>');
        }
        return result;
    };

    /******** FETCH DATA ********/
    this.fetchData = function(path, methodType, type, async, callback) {
        return jQuery.ajax({
            url: path,
            async: async,
            beforeSend: function(xhrObj) {
                // xhrObj.setRequestHeader("X-Content-Type-Options", "nosniff");
            },
            type: methodType,
            dataType: type,
            success: function(data) {
                callback(data);
            },
            error: function(e) {
                console.log(e);
            }
        });
    };

    /******** FETCH POST DATA ********/
    this.fetchPostData = function(path, methodType, type, async, postData, callback) {
        if (navigator.userAgent.match(/msie/i) && window.XDomainRequest) {
            var xdr = new XDomainRequest();

            xdr.open("post", path);

            xdr.onload = function() {
                return callback(JSON.parse(xdr.responseText));
            }

            setTimeout(function() {
                xdr.send(postData);
            }, 0);
        } else {
            return jQuery.ajax({
                url: path,
                async: async,
                beforeSend: function(xhrObj) {
                    // xhrObj.setRequestHeader("X-Content-Type-Options", "nosniff");
                },
                data: postData,
                type: methodType,
                dataType: type,
                success: function(data) {
                    callback(data);
                },
                error: function(e) {
                    console.log(e);
                }
            });
        }
    };

    /******** Capture WEB PAGE ********/
    this.captureWebPage = function() {
        if (jQuery(window).width() >= $nefwi.params.screenCaptureResolutionLimit) {
            if (jQuery('.captureImage').length > 0) {
                jQuery('.feedback_thumb_image').html('');
            }
            jQuery('.' + $nefwi.params.feedbackOverlayClass).attr('data-html2canvas-ignore', '');
            var btn = jQuery('#' + $nefwi.params.submitButtonId);
            btn.attr('disabled', 'true');
            jQuery('.feedback_thumb_image').html('Capturing Image Please Wait..');
            html2canvas(document.body, {
                useCORS: true,
                onrendered: function(canvas) {
                    var dataUrl = canvas.toDataURL("image/png");
                    jQuery('#' + $nefwi.params.captureImageTextId).val(dataUrl);
                    jQuery('.feedback_thumb_image').html('<div class="prelative"><button type="button" class="removeImage feedback-close cirlce-close-icon"  aria-hidden="true" ></button><img src="' + dataUrl + '" class="captureImage"/><input type="hidden" value="' + dataUrl + '" name="' + $nefwi.params.captureImageTextName + '"/></div>');
                    btn.removeAttr('disabled');
                    jQuery('.removeImage').unbind('click').bind('click', function(e) {
                        e.preventDefault();
                        jQuery('#' + $nefwi.params.captureImageTextId).val('');
                    });
                }
            });
        }
    };

    /******** POST FEEDBACK ********/
    this.postFeedback = function() {
        var isValid = jQuery('#' + $nefwi.params.formName).valid();
        if (isValid) {
            var data = jQuery('#' + $nefwi.params.formName).serializeObject();
            var rand = Math.random().toString(36).slice(2).substring(1);
            data.Apikey = $nefwi.apiKey;
            data.ReleaseStage = $nefwi.releaseStage;
            var timestamp = (new Date().getTime() / 1000).toFixed(0);
            data.SupportTimeStamp = timestamp;
            if ($nefwi.files) {
                data.feedbackAttachment = rand + $nefwi.files.name;
            }
            var dataString = JSON.stringify(data);
            jQuery('.loader-pleasewait,.fade-block').show();


            $nefwi.fetchPostData($nefwi.END_POINT, 'POST', 'json', true, dataString, function(result) {
                var randomCaptchaId = Math.random().toString(36).slice(2).substring(1);

                jQuery('.feedback-error').remove();


                jQuery('#' + $nefwi.params.captchaImage).attr('src', $nefwi.SECURIMAGE_END_POINT + '?captchaId=' + randomCaptchaId);

                jQuery('#' + $nefwi.params.captchaImageId).val(randomCaptchaId);
                if (result.status == 1) {
                    jQuery('.' + $nefwi.params.feedbackBody).append('<div class="feedback-error alert alert-dismissable alert-danger"><button type="button" class="feedback-close"  aria-hidden="true">&times;</button><span>' + result.statusMessage + '</span></div>');

                } else {
                    if ($nefwi.uploader!=undefined) {
                    if ($nefwi.uploader.files.length > 0) {
                        $nefwi.uploader.bind('BeforeUpload', function(up, file) {
                            if (typeof(result.results.FeedbackId) != 'undefined') {
                                up.setOption('url', $nefwi.FILE_END_POINT + '?feedback_id=' + result.results.FeedbackId);
                                up.setOption('multipart_params', {
                                    apikey: $nefwi.apiKey
                                });
                            }
                            up.refresh();
                            up.trigger('UploadFile', file);
                        });
                        $nefwi.uploader.bind('FileUploaded', function(up, file, response) {
                            $nefwi.uploader.stop();
                        });
                        $nefwi.uploader.bind('UploadComplete', function(up, files) {
                            $nefwi.uploader.stop();
                        });
                        $nefwi.uploader.start();
                    }
                };
                    jQuery('.' + $nefwi.params.feedbackBody).append('<div class="feedback-error alert alert-dismissable alert-success"><button type="button" class="feedback-close"  aria-hidden="true">&times;</button><span>' + result.statusMessage + '</span></div>');
                    jQuery('#' + $nefwi.params.captureImageTextId).val('');
                    $nefwi.resetForm();
                }
                jQuery('.loader-pleasewait,.fade-block').hide();
                jQuery('.feedback-error').delay(5000).hide('fade', function() {
                    jQuery(this).remove();
                });
                return false;
            });
        }
    };

    /************RESET FORM ************/
    this.resetForm = function() {
        if (jQuery('#' + $nefwi.params.formName)[0]!=undefined) {
        jQuery('#' + $nefwi.params.formName)[0].reset();
        jQuery('#' + $nefwi.params.mainId).fadeOut("slow", function() {
            jQuery('#' + $nefwi.params.mainId).remove();
            jQuery('.' + $nefwi.params.feedbackOverlayClass).remove();
            jQuery('body').removeClass('feedback-modal-open');
            jQuery("body").css('overflow', '');
            // Animation complete.
        });
        };


    };
    /******** SET LABEL OPTIONS ********/
    this.setLabelOptions = function() {
        var zIndex = $nefwi.$defaults.baseZ;

        this.titleCSS = $nefwi.options.feedbackTitleCSS || {};

        this.feedbackWidgetLabelIcon = $nefwi.options.feedbackWidgetLabelIcon || {};

        var $label = jQuery('<div  data-html2canvas-ignore="" href="javascript:void(0);"  class="' + $nefwi.params.labeClass + '" style="display:none;z-index:' + (zIndex + 10) + ';" target="_self"><div class="iconholder"></div><div class="fLeft">' + ($nefwi.options.feedbackTitle || '&nbsp;') + '</div></div>');

        // Adding CLASS 
        $label.addClass($nefwi.options.feedbackLabelPosition);

        // Adding CSS 
        $label.css(this.titleCSS);

        $label.find('.iconholder').css('background', 'url(' + this.feedbackWidgetLabelIcon + ')  no-repeat scroll center center rgba(0, 0, 0, 0)');
        var lineHeight = this.titleCSS.fontSize.replace("px", "");
        $label.css('line-height', (parseInt(lineHeight) + 6) + 'px');

        jQuery('body').append($label);
    };

}
