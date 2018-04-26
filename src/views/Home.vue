<template>
    <div class="hello">
        <!-- 头部 -->
        <header class="layout-header navbar navbar-light" role="navigation">
            <div class="container">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle" data-toggle="collapse"
                            data-target="#navbar-collapse">
                        <span class="sr-only">切换导航</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#">Slides</a>
                </div>
                <div id="navbar-collapse" class="collapse navbar-collapse">
                    <ul class="nav navbar-nav" id="menu-layoutit">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                                文件 <i class="caret"></i>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li><a id="new" href="#">新建</a></li>
                                <li><a id="save" href="#">保存</a></li>
                            </ul>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                                插入 <i class="caret"></i>
                            </a>
                            <ul class="dropdown-box dropdown-box-right insert-box">
                                <button id="insert-text" class="btn btn-info" href="#undo">文字</button>
                                <button id="insert-img" class="btn btn-info" href="#undo"><i class="icon icon-photo"></i> 图片</button>
                                <button class="btn btn-info" href="#undo" @click.prevent="selectImage">从其他应用选择图片</button>
                                <button id="insert-shape" class="btn btn-info" href="#undo">形状</button>
                                <button id="insert-table" class="btn btn-info" href="#undo">表格</button>
                                <button id="insert-video" class="btn btn-info" href="#redo"><i class="glyphicon glyphicon-arrow-right"></i> 视频</button>
                                <button id="music" class="btn btn-info" href="#redo"><i class="glyphicon glyphicon-arrow-right"></i> 音乐</button>
                            </ul>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                                版式 <i class="caret"></i>
                            </a>
                            <ul class="dropdown-box dropdown-box-right design-box">
                                <!-- <my-template :select="selectTemplate" @select="selectTemplate" /> -->
                                <ul id="design-list" class="design-list">
                                    <li class="design-item">
                                        <div class="viewport-box">
                                            <div class="viewport">
                                                <div class="elem elem-text" data-type="text" style="position: absolute; top: 192px; left: 20px; width: 761px; font-size: 40px;z-index: 0">
                                                    <div class="elem-content"><p style="text-align: center" placeholder="输入标题">双击此处添加标题</p></div>
                                                </div>
                                                <div class="elem elem-text" data-type="text" style="position: absolute; top: 298px; left: 23px; width: 754px; font-size: 30px;z-index: 1" data-anim="fadeIn">
                                                    <div class="elem-content" placeholder="输入文本"><p style="text-align: center">双击此处添加文本</p></div>
                                                </div>
                                            </div>
                                            <div class="viewport-mask"></div>
                                        </div>
                                    </li>
                                    <li class="design-item">
                                        <div class="viewport-box">
                                            <div class="viewport">
                                                <div class="elem elem-text" data-type="text" style="position: absolute; top: 23px; left: 20px; width: 761px; font-size: 40px;z-index: 0">
                                                    <div class="elem-content"><p placeholder="输入标题">双击此处添加标题</p></div>
                                                </div>
                                                <div class="elem elem-text" data-type="text" style="position: absolute; top: 105px; left: 23px; width: 754px; font-size: 30px;z-index: 1" data-anim="fadeIn">
                                                    <div class="elem-content" placeholder="输入文本"><p>双击此处添加文本</p></div>
                                                </div>
                                            </div>
                                            <div class="viewport-mask"></div>
                                        </div>
                                    </li>
                                    <li class="design-item">
                                        <div class="viewport-box">
                                            <div class="viewport" style="background-color: #fff;background-image: url(/static/img/tpl/bg15.jpg)">
                                                <div class="elem elem-text" data-type="text" style="position: absolute; top: 168px; left: 20px; width: 761px; font-size: 40px;z-index: 0">
                                                    <div class="elem-content"><p style="text-align: center" placeholder="输入标题">双击此处添加标题</p></div>
                                                </div>
                                                <div class="elem elem-text" data-type="text" style="position: absolute; top: 242px; left: 23px; width: 754px; font-size: 30px;z-index: 1" data-anim="fadeIn">
                                                    <div class="elem-content" placeholder="输入文本"><p style="text-align: center">双击此处添加文本</p></div>
                                                </div>
                                            </div>
                                            <div class="viewport-mask"></div>
                                        </div>
                                    </li>
                                    <li class="design-item">
                                        <div class="viewport-box">
                                            <div class="viewport">
                                                <div class="elem elem-text" data-type="text"
                                                     style="position: absolute; top: 163px; left: 199.5px; z-index: 0; width: 400px; cursor: auto; font-size: 80px; color: rgb(87, 99, 107);">
                                                    <div class="elem-content"><p style="text-align: center; ">谢谢</p></div>
                                                </div>
                                                <div class="elem elem-text" data-type="text"
                                                     style="position: absolute; top: 285px; left: 263px; z-index: 1; width: 273.5px; cursor: auto; height: 7px; background-color: rgb(115, 115, 115);">
                                                    <div class="elem-content"><p><br></p></div>
                                                </div>
                                            </div>
                                            <div class="viewport-mask"></div>
                                        </div>
                                    </li>
                                </ul>
                            </ul>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                                图表 <i class="caret"></i>
                            </a>
                            <ul class="dropdown-box dropdown-box-right chart-box">
                                <ul id="chart-list" class="chart-list">
                                    <li id="insert-chart1" class="chart-item">
                                        <img class="chart-img" src="/static/img/chart-1-1.png">
                                    </li>
                                    <li id="insert-chart2" class="chart-item">
                                        <img class="chart-img" src="/static/img/chart-2-1.png">
                                    </li>
                                    <li id="insert-chart3" class="chart-item">
                                        <img class="chart-img" src="/static/img/chart-3-1.png">
                                    </li>
                                </ul>
                            </ul>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                                视图 <i class="caret"></i>
                            </a>
                            <ul class="dropdown-box dropdown-box-right insert-box">
                                <!--<label class="control-label">
                                    <input class="form-control" type="checkbox" checked>
                                    自动对齐
                                </label>-->
                                <button id="style" class="btn btn-info" href="#redo">切换大小</button>
                            </ul>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown">
                                帮助 <i class="caret"></i>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-right">
                                <li><router-link to="/help" target="_blank">帮助页面</router-link></li>
                                <li><a href="#" @click="about">关于</a></li>
                            </ul>
                        </li>
                    </ul>
                    <ul class="nav navbar-nav pull-right">
                        <li class="nav-item navbar-form">
                            <a id="display-show" class="btn btn-default">预览</a>
                            <a id="fullscreen" class="btn btn-default">全屏</a>
                        </li>

                        <li class="nav-item"><a class="nav-link" href="http://tool.yunser.com" target="_blank">更多工具</a> </li>
                    </ul>
                </div>
            </div>
        </header>
        <!-- /头部 -->
        <div class="layout-body">
            <div class="layout-side">
                <ul id="preview-list" class="preview-list">
                    <li class="preview-item  active">
                        <span class="page">1</span>
                        <div class="viewport-box">
                            <div class="viewport" data-bg="default" style="background-color: #fff;">
                                <div class="elem elem-image" data-type="image"
                                     style="position: absolute; top: 0px; left: 79.5px; z-index: 2; width: 595px; height: 119px; cursor: auto;">
                                    <img class="elem-content" src="/static/img/image-1-1.png"></div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 225px; left: 177px; z-index: 1; width: 400px; cursor: auto; font-size: 30px; color: rgb(122, 131, 138);">
                                    <div class="elem-content"><p style="text-align: center; ">小清新水彩花卉毕业答辩模板</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 279px; left: 221px; z-index: 2; width: 312px; cursor: auto; border: 1px solid rgb(153, 162, 168); line-height: 2.4; height: 36px; font-size: 14px;">
                                    <div class="elem-content"><p style="text-align: center; ">THESIS DEFENSE POWERPOINT
                                        TEMPLATE</p></div>
                                </div>
                            </div>
                            <div class="viewport-mask"></div>
                        </div>
                    </li>
                    <li class="preview-item">
                        <span class="page">1</span>
                        <div class="viewport-box">
                            <div class="viewport" data-bg="default" style="background-color: #fff;">
                                <div class="elem elem-image" data-type="image"
                                     style="position: absolute; top: 0px; left: 0px; z-index: 2; width: 135px; height: 551px; cursor: auto;">
                                    <img class="elem-content" src="/static/img/image-1-2.png"></div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 192.5px; left: 159px; z-index: 1; width: 50px; cursor: auto; font-size: 40px; color: rgb(176, 125, 207);">
                                    <div class="elem-content"><p>目录</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 67px; left: 376.5px; z-index: 2; width: 48px; cursor: auto; border: 1px solid rgb(95, 102, 107); line-height: 1.7; height: 48px; font-size: 30px; color: rgb(160, 172, 181);">
                                    <div class="elem-content"><p style="text-align: center; ">01</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 145px; left: 376.5px; z-index: 2; width: 48px; cursor: auto; border: 1px solid rgb(95, 102, 107); line-height: 1.7; height: 48px; font-size: 30px; color: rgb(149, 159, 166);">
                                    <div class="elem-content"><p style="text-align: center; ">02</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 228.5px; left: 376.5px; z-index: 2; width: 48px; cursor: auto; border: 1px solid rgb(95, 102, 107); line-height: 1.7; height: 48px; font-size: 30px; color: rgb(160, 172, 181);">
                                    <div class="elem-content"><p style="text-align: center; ">03</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 309px; left: 376.5px; z-index: 2; width: 48px; cursor: auto; border: 1px solid rgb(95, 102, 107); line-height: 1.7; height: 48px; font-size: 30px; color: rgb(160, 172, 181);">
                                    <div class="elem-content"><p style="text-align: center; ">04</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 392px; left: 376.5px; z-index: 2; width: 48px; cursor: auto; border: 1px solid rgb(95, 102, 107); line-height: 1.7; height: 48px; font-size: 30px; color: rgb(160, 172, 181);">
                                    <div class="elem-content"><p style="text-align: center; ">05</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 76px; left: 447.5px; z-index: 7; width: 103.5px; cursor: auto; color: rgb(94, 100, 105); font-size: 20px;">
                                    <div class="elem-content"><p>绪论</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 151.5px; left: 447.5px; z-index: 7; width: 147.5px; cursor: auto; color: rgb(94, 100, 105); font-size: 20px;">
                                    <div class="elem-content"><p>研究思路与方法</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 238.5px; left: 447.5px; z-index: 7; width: 180.5px; cursor: auto; color: rgb(94, 100, 105); font-size: 20px;">
                                    <div class="elem-content"><p>关键技术与实践难点</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 317px; left: 447.5px; z-index: 7; width: 150.5px; cursor: auto; color: rgb(94, 100, 105); font-size: 20px;">
                                    <div class="elem-content"><p>研究成果与应用</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 400px; left: 447.5px; z-index: 7; width: 193px; cursor: auto; color: rgb(94, 100, 105); font-size: 20px;">
                                    <div class="elem-content"><p>相关建议与论文总结</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 237.5px; left: 175.5px; z-index: 12; width: 104px; cursor: auto; font-size: 16px; color: rgb(120, 120, 120); border: 1px solid rgb(125, 125, 125); line-height: 1.7; height: 29px; transform: rotateZ(90deg);">
                                    <div class="elem-content"><p style="text-align: center; ">CONTENTS</p></div>
                                </div>

                            </div>
                            <div class="viewport-mask"></div>
                        </div>
                    </li>
                    <li class="preview-item">
                        <span class="page">1</span>
                        <div class="viewport-box">
                            <div class="viewport" data-bg="default" style="background-color: #fff;">
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 166.5px; left: 168px; z-index: 0; width: 172px; cursor: auto; border: 1px solid rgb(118, 125, 130); height: 172px; font-size: 100px; font-family: 黑体; vertical-align: middle; color: rgb(85, 91, 94); line-height: 1.7;">
                                    <div class="elem-content"><p style="text-align: center;  font-family: 'MyriadSetPro';">01</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 166.5px; left: 376.5px; z-index: 1; width: 113px; cursor: auto; font-size: 28px; color: rgb(186, 124, 180);">
                                    <div class="elem-content"><p>绪论</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 222.5px; left: 367.5px; z-index: 2; width: 400px; cursor: auto; line-height: 1.6; font-size: 18px;">
                                    <div class="elem-content"><p>
                                    </p>
                                        <ul>
                                            <li><span>选题背景</span><br></li>
                                            <li>国内外相关研究综述</li>
                                            <li>理论基础与文献综述</li>
                                            <li>主要贡献与创新</li>
                                        </ul>
                                        <p></p></div>
                                </div>
                                <div class="elem elem-image" data-type="image"
                                     style="position: absolute; top: 56px; left: 0px; z-index: 3; width: 106px; height: 393.5px; cursor: auto;">
                                    <img class="elem-content" src="/static/img/image-1-3.png"></div>

                                <div class="elem elem-image" data-type="image"
                                     style="position: absolute; top: 56px; left: 631px; z-index: 4; width: 123px; height: 393px; cursor: auto;">
                                    <img class="elem-content" src="/static/img/image-1-4.png"></div>

                            </div>
                            <div class="viewport-mask"></div>
                        </div>
                    </li>
                    <li class="preview-item">
                        <span class="page">1</span>
                        <div class="viewport-box">
                            <div class="viewport" data-bg="default" style="background-color: #fff;">
                                <div class="elem elem-image" data-type="image"
                                     style="position: absolute; top: -10px; left: -11px; z-index: 1; width: 100px; height: 100px; cursor: auto;">
                                    <img class="elem-content" src="/static/img/image-1-5.png"></div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 35px; left: 88px; z-index: 2; width: 400px; cursor: auto; font-size: 26px; color: rgb(196, 145, 185);">
                                    <div class="elem-content"><p>绪论</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 74px; left: 88px; z-index: 3; width: 400px; cursor: auto;">
                                    <div class="elem-content"><p>选题背景</p></div>
                                </div>
                                <div class="elem elem-shape" data-type="chart" data-chart="pie" data-data="1,2,3,4"
                                     style="position: absolute; top: 163px; left: 279px; z-index: 0; width: 196px; height: 179px; cursor: auto;">
                                    <div class="elem-content">
                                        <svg id="svg-1493042467628" width="196" height="179"
                                             xmlns="http://www.w3.org/2000/svg" version="1.1"
                                             xmlns:xlink="http://www.w3.org/1999/xlink">
                                            <circle id="SvgjsCircle1037" r="89.5" cx="89.5" cy="89.5"
                                                    fill="#8d4ccf"></circle>
                                            <path id="SvgjsPath1038"
                                                  d="M89.5 89.5L179 89.5A89.5 89.5 0 1 0 179 89.50000000000003Z "
                                                  fill="#19bcc6"></path>
                                            <path id="SvgjsPath1039"
                                                  d="M89.5 89.5L179 89.5A89.5 89.5 0 1 0 17.09297900344221 142.10678008017635Z "
                                                  fill="#a9e810"></path>
                                            <path id="SvgjsPath1040"
                                                  d="M89.5 89.5L179 89.5A89.5 89.5 0 0 0 61.84297900344221 4.380441791583749Z "
                                                  fill="#f5a932"></path>
                                            <path id="SvgjsPath1041"
                                                  d="M89.5 89.5L179 89.5A89.5 89.5 0 0 0 161.90702099655778 36.89321991982366Z "
                                                  fill="#ee6969"></path>
                                            <defs id="SvgjsDefs1042"></defs>
                                        </svg>
                                    </div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 225px; left: 415px; z-index: 4; width: 68px; cursor: auto; color: rgb(255, 255, 255);">
                                    <div class="elem-content"><p>其他</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 229px; left: 301.5px; z-index: 5; width: 50.5px; cursor: auto; color: rgb(255, 255, 255);">
                                    <div class="elem-content"><p>书籍</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 193px; left: 371px; z-index: 6; width: 91px; cursor: auto; color: rgb(255, 255, 255);">
                                    <div class="elem-content"><p>论文</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 289px; left: 370.5px; z-index: 7; width: 90px; cursor: auto; color: rgb(255, 255, 255);">
                                    <div class="elem-content"><p>网站</p></div>
                                </div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 371px; left: 177px; z-index: 8; width: 400px; cursor: auto; font-size: 30px; color: rgb(125, 131, 135);">
                                    <div class="elem-content"><p style="text-align: center; ">资料来源</p></div>
                                </div>

                            </div>
                            <div class="viewport-mask"></div>
                        </div>
                    </li>
                    <li class="preview-item">
                        <span class="page">1</span>
                        <div class="viewport-box">
                            <div class="viewport" data-bg="default" style="background-color: #fff;">
                                <div class="elem elem-image" data-type="image"
                                     style="position: absolute; top: 366px; left: 53px; z-index: 0; width: 648px; height: 139px; cursor: auto;">
                                    <img class="elem-content" src="/static/img/image-1-6.png"></div>
                                <div class="elem elem-text" data-type="text"
                                     style="position: absolute; top: 217.5px; left: 125.5px; z-index: 1; width: 503px; cursor: auto; font-size: 30px; color: rgb(122, 127, 130);">
                                    <div class="elem-content"><p style="text-align: center; ">敬 请 各 位 老 师 批 评 指 正</p></div>
                                </div>
                            </div>
                            <div class="viewport-mask"></div>
                        </div>
                    </li>
                </ul>
                <a id="new-page" class="new-page" href="#"><i class="icon icon-add"></i> 添加新页面</a>
            </div>
            <div class="layout-content">
                <div id="device" class="device">
                    <div id="template" class="template"></div>
                    <div class="demo">
                        <div id="editor" class="demo2" style="width: 100%; height: 100%; background-size: 100% 100%;">
                        </div>
                    </div>
                </div>
                <div class="status">
                    <span id="page" class="page">第 1 张，共 3 张</span>
                    <span id="position" class="position">(0, 0)</span>
                </div>
            </div>
            <!-- 右侧工具 -->
            <div id="edit-tool" class="edit-tool">
                <ul id="tool-tab" class="nav nav-tabs">
                    <div class="nav-item active"><a id="tab-style" class="nav-link" href="#tab11" data-toggle="tab">编辑</a></div>
                    <div class="nav-item"><a class="nav-link" href="#tab12" data-toggle="tab">外观</a></div>
                    <div class="nav-item"><a id="tab-index" class="nav-link" href="#tab13" data-toggle="tab">排列</a></div>
                    <div class="nav-item"><a id="tab-anim" class="nav-link" href="#tab14" data-toggle="tab">动画</a></div>
                    <div class="nav-item"><a class="nav-link" href="#tab15" data-toggle="tab">切换</a></div>
                </ul>
                <div class="tab-content">
                    <div id="tab11" class="tab-pane fade active in">
                        <div class="form-horizontal">
                            <div class="editor-box editor-shape-box">
                                <div class="form-groups">
                                    <h4 class="title">形状编辑</h4>
                                    <div class="form-group">
                                        <label class="control-label">填充色</label>
                                        <input id="editor-fill-color" class="form-control" type="text">
                                    </div>
                                </div>
                            </div>
                            <div class="editor-box editor-chart-box">
                                <div class="form-groups">
                                    <h4 class="title">图表编辑</h4>
                                    <div class="form-group">
                                        <label class="control-label">图表类型</label>
                                        <select id="editor-chart-type" class="form-control">
                                            <option value="pie">饼状图</option>
                                            <option value="bar">条形图</option>
                                            <option value="line">折线图</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-groups">
                                    <h4 class="title">数据</h4>
                                    <!--<table class="table-data">
                                        <tr>
                                            <td>1</td>
                                            <td>2</td>
                                            <td>3</td>
                                            <td>4</td>
                                            <td>5</td>
                                        </tr>
                                    </table>-->
                                    <div class="form-group">
                                        <label class="control-label">表格数据</label>
                                        <input id="editor-data" class="form-control" type="text" value="1,2,3,4,5">
                                    </div>
                                    <div class="form-group">
                                        <button id="chart-update" class="btn btn-primary">更新</button>
                                    </div>
                                </div>
                            </div>
                            <div id="editor-img-box" class="editor-box editor-image-box">
                                <div class="form-groups">
                                    <h4 class="title">图片编辑</h4>
                                    <div class="form-group">
                                        <button id="editor-relace-img" class="btn btn-primary">替换图片</button>
                                        <button class="btn btn-primary" @click="replaceImage">从其他应用选择图片并替换</button>
                                    </div>
                                </div>


                            </div>
                            <div id="editor-base-box" class="editor-box editor-base-box">
                                <div class="form-groups">
                                    <h4 class="title">当前页背景</h4>
                                    <div id="edidtor-bg-display" class="edidtor-bg-display"></div>
                                    <div class="form-group">
                                        <button id="editor-base-bg-img" class="btn btn-default"><i class="icon icon-photo"></i></button>
                                        <button id="editor-base-bg-img-cancel" class="btn btn-default" data-toggle="tooltip" title="" data-original-title="删除背景"><i class="icon icon-delete"></i></button>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">背景颜色</label>
                                        <input id="editor-base-bg-color" class="form-control" type="color">
                                    </div>
                                </div>
                                <div class="form-groups">
                                    <h4 class="title">母版背景</h4>
                                    <div id="edidtor-bg-display2" class="edidtor-bg-display"></div>
                                    <div class="form-group">
                                        <button id="editor-base-bg-img2" class="btn btn-default">设置母版图片</button>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">背景颜色</label>
                                        <input id="editor-template-bg-color" class="form-control" type="color">
                                    </div>
                                </div>
                            </div>
                            <div id="editor-text-edit" class="editor-box editor-text-ediotr-box">
                                <div class="title">编辑文字</div>
                                <div>
                                    <a id="bold" class="btn btn-default" href="#" title="加粗"><i class="icon icon-bold"></i></a>
                                    <a id="italic" class="btn btn-default" href="#" title="斜体"><i class="icon icon-italic"></i></a>
                                    <a id="underline" class="btn btn-default" href="#" title="下划线"><i class="icon icon-underline"></i></a>
                                    <a id="strikethrough" class="btn btn-default" href="#" title="删除线"><i class="icon icon-strikethrough"></i></a>
                                    <a id="select-color" class="btn btn-default" href="#" title="颜色"><i class="icon icon-font-color"></i></a>
                                    <a id="select-bgcolor" class="btn btn-default" href="#" title="背景颜色"><i class="icon icon-background-color"></i></a>
                                    <a id="superscript" class="btn btn-default" href="#" title="上标"><i class="icon icon-superscript"></i></a>
                                    <a id="subscript" class="btn btn-default" href="#" title="下标"><i class="icon icon-subscript"></i></a>
                                </div>
                                <div>
                                    <div class="btn-group">
                                        <a id="align-left" class="btn btn-default" href="#" title="左对齐"><i class="icon icon-align-left"></i></a>
                                        <a id="align-center" class="btn btn-default" href="#" title="居中"><i class="icon icon-align-center"></i></a>
                                        <a id="align-right" class="btn btn-default" href="#" title="右对齐"><i class="icon icon-align-right"></i></a>
                                    </div>
                                    <div class="btn-group">
                                        <a id="unorderlist" class="btn btn-default" href="#" title="无序列表"><i class="icon icon-list"></i></a>
                                        <a id="orderlist" class="btn btn-default" href="#" title="有序列表"><i class="icon icon-list-order"></i></a>
                                    </div>
                                    <div class="btn-group">
                                        <a id="link" class="btn btn-default" href="#" title="超链接"><i class="icon icon-link"></i></a>
                                        <a id="unlink" class="btn btn-default" href="#" title="取消超链接"><i class="icon icon-unlink"></i></a>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="control-label">字体</label>
                                    <select id="editor-font-family" class="form-control">
                                        <option>微软雅黑</option>
                                        <option>宋体</option>
                                        <option>仿宋</option>
                                        <option>楷体</option>
                                        <option>黑体</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="control-label">字号</label>
                                    <input id="editor-font-size" class="form-control" type="number">
                                </div>
                                <div class="hr"></div>
                            </div>
                            <div id="editor-text-edit2" class="editor-box editor-text-ediotr-box">
                                <!-- 文字样式 -->
                                <div class="form-groups">
                                    <h4 class="title">文字样式</h4>
                                    <div class="form-group">
                                        <label class="control-label">文字颜色</label>
                                        <input id="select-color2" class="form-control" type="color">
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">字体</label>
                                        <select id="editor-font-family2" class="form-control">
                                            <option>微软雅黑</option>
                                            <option>宋体</option>
                                            <option>仿宋</option>
                                            <option>楷体</option>
                                            <option>黑体</option>
                                            <option>Open Sans</option>
                                            <option>Verdana</option>
                                            <option>Tahoma</option>
                                            <option>Georgia</option>
                                            <option>Trebuchet MS</option>
                                            <option>Lucida Family</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">字号</label>
                                        <input id="editor-font-size2" class="form-control" type="number" min="12" max="500">
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">行高</label>
                                        <input id="editor-lineheight" class="form-control" type="number" min="0" max="6" value="1.5" step="0.1">
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">字符间距</label>
                                        <input id="editor-letter-spacing" class="form-control" type="number" min="0" max="100">
                                    </div>
                                </div>
                                <!-- 文字阴影 -->
                                <div class="form-groups">
                                    <h4 class="title">文字阴影</h4>
                                    <div class="form-group">
                                        <label class="control-label">阴影</label>
                                        <select id="editor-shadow" class="form-control">
                                            <option value="none">禁用</option>
                                            <option value="use">启用</option>
                                        </select>
                                    </div>
                                    <div id="editor-shadow-box" class="editor-shadow-box">
                                        <div class="form-group">
                                            <label class="control-label">X偏移</label>
                                            <input id="editor-shadow-x-offset" class="form-control" type="number" max="50" min="-50" step="1">
                                        </div>
                                        <div class="form-group">
                                            <label class="control-label">Y偏移</label>
                                            <input id="editor-shadow-y-offset" class="form-control" type="number" max="50" min="-50" step="1">
                                        </div>
                                        <div class="form-group">
                                            <label class="control-label">模糊半径</label>
                                            <input id="editor-shadow-blur" class="form-control" type="number" max="100" min="0" step="1">
                                        </div>
                                        <div class="form-group">
                                            <label class="control-label">阴影颜色</label>
                                            <input id="editor-shadow-color" class="form-control" type="text">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tab12" class="tab-pane fade">
                        <div class="form-horizontal">
                            <div class="editor-box editor-base-box">
                                <div class="tip">请选择组件进行编辑</div>
                            </div>
                            <div id="editor-text-box" class="editor-box editor-text-box">
                                <div class="form-groups">
                                    <h4 class="title">基本样式</h4>
                                    <!--<div class="form-group">
                                        <label class="control-label">字体</label>
                                        <select id="editor-font-family" class="form-control">
                                            <option>微软雅黑</option>
                                            <option>宋体</option>
                                            <option>仿宋</option>
                                            <option>楷体</option>
                                            <option>黑体</option>
                                        </select>
                                    </div>-->
                                    <!--<div class="form-group">
                                        <label class="control-label">字号</label>
                                        <input id="editor-font-size" class="form-control" type="number">
                                    </div>-->
                                    <!--<div class="form-group">
                                        <label class="control-label">背景颜色</label>
                                        <input id="editor-bg-color" class="form-control" type="text">
                                    </div>-->
                                    <div class="form-group">
                                        <label class="control-label">背景颜色</label>
                                        <input id="editor-bg-color" class="form-control" type="text">
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">不透明度</label>
                                        <input id="editor-opacity" class="form-control" type="number" max="100" min="0" step="1">
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">圆角</label>
                                        <input id="editor-border-radius" class="form-control" min="0" type="number">
                                    </div>
                                    <div class="form-group">
                                        <label class="control-label">旋转</label>
                                        <input id="editor-rotate" class="form-control" min="0" max="359" type="number">
                                    </div>
                                </div>
                                <div class="form-groups">
                                    <h4 class="title">边框样式</h4>
                                    <div class="form-group">
                                        <label class="control-label">边框样式</label>
                                        <select id="editor-border-style" class="form-control">
                                            <option value="none">无边框</option>
                                            <option value="solid">实线</option>
                                            <option value="dashed">虚线</option>
                                            <option value="dotted">点</option>
                                            <option value="double">双线</option>
                                        </select>
                                    </div>
                                    <div id="border-width-and-color">
                                        <div class="form-group">
                                            <label class="control-label">边框大小</label>
                                            <input id="editor-border-width" class="form-control" type="number" min="1" max="100">
                                        </div>
                                        <div class="form-group">
                                            <label class="control-label">边框颜色</label>
                                            <!--<div id="editor-border-color" class="ui-color"></div>-->
                                            <input id="editor-border-color" class="form-control" type="text">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-groups editor-box editor-common-box">
                                <h4 class="title">大小及位置</h4>
                                <div class="form-group">
                                    <label class="control-label">宽度</label>
                                    <input id="editor-width" class="form-control" type="number" min="0">
                                </div>
                                <div class="form-group">
                                    <label class="control-label">高度</label>
                                    <input id="editor-height" class="form-control" type="number" min="0">
                                </div>
                                <div class="form-group">
                                    <label class="control-label">水平位置X</label>
                                    <input id="editor-left" class="form-control" type="number">
                                </div>
                                <div class="form-group">
                                    <label class="control-label">垂直位置Y</label>
                                    <input id="editor-top" class="form-control" type="number">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tab13" class="tab-pane fade">
                        <ul id="index-list" class="index-list">
                            <li class="list-item active">
                                <span class="type">图片</span>
                                <div class="content">
                                    <img src="/static/img/tpl/img1.png">
                                </div>
                            </li>
                            <li class="list-item">
                                <span class="type">文字</span>
                                <div class="content">
                                    <span>1231234</span>
                                </div>

                            </li>
                        </ul>
                    </div>
                    <div id="tab14" class="tab-pane fade">
                        <div class="form-horizontal">
                            <div class="editor-box editor-base-box">
                                <div class="tip">请选择组件进行编辑</div>
                            </div>
                            <div class="editor-box editor-common-box">
                                <div class="form-groups">
                                    <h4 class="title">动画样式</h4>
                                    <div class="form-group">
                                        <label class="control-label">动画方式</label>
                                        <select id="editor-anim-name" class="form-control">
                                            <optgroup label="默认">
                                                <option value="">无</option>
                                            </optgroup>
                                            <optgroup label="强调">
                                                <option value="bounce">弹跳</option>
                                                <option value="flash">闪烁</option>
                                                <option value="pulse">脉动</option>
                                                <option value="rubberBand">橡皮圈</option>
                                                <option value="shake">摇动</option>
                                                <option value="swing">摆动</option>
                                                <option value="tada">波动</option>
                                                <option value="wobble">晃动</option>
                                            </optgroup>
                                            <optgroup label="进入">
                                                <option value="fadeIn">淡入</option>
                                                <option value="zoomInDown">底部进入</option>
                                            </optgroup>
                                            <optgroup label="退出">
                                                <option value="mercedes">Mercedes</option>
                                                <option value="audi">Audi</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div id="editor-anim-box">
                                        <!-- <div class="form-group">
                                             <label class="control-label">运动方向</label>
                                             <select class="form-control">
                                                 <option>方向一</option>
                                                 <option>方向二</option>
                                             </select>
                                         </div>-->
                                        <div class="form-group">
                                            <label class="control-label">开始时间（毫秒）</label>
                                            <input id="editor-anim-delay" class="form-control" type="number" min="0">
                                        </div>
                                        <div class="form-group">
                                            <label class="control-label">动画时间（毫秒）</label>
                                            <input id="editor-anim-duration" class="form-control" type="number" min="0">
                                        </div>
                                        <div class="form-group">
                                            <label class="control-label">执行次数</label>
                                            <select id="editor-anim-count" class="form-control">
                                                <optgroup label="次数">
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">5</option>
                                                    <option value="6">6</option>
                                                    <option value="7">7</option>
                                                    <option value="8">8</option>
                                                    <option value="9">9</option>
                                                    <option value="10">10</option>
                                                </optgroup>
                                                <optgroup label="循环">
                                                    <option value="linear">无限循环</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <!--<button id="editor-add-anim" class="btn btn-primary">添加动画</button>-->
                                            <button id="editor-play-anim" class="btn btn-success">播放动画</button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div id="tab15" class="tab-pane fade">
                        <div class="form-horizontal">
                            <div>
                                <div class="form-group">
                                    <label class="control-label">切换方式</label>
                                    <select id="editor-switch" class="form-control">
                                        <option value="none">无动画</option>
                                        <option value="fade">淡入淡出</option>
                                        <option value="move" selected>移动</option>
                                        <option value="flip">翻转</option>
                                        <option value="fall">掉落</option>
                                        <option value="newspaper">旋转</option>
                                        <option value="carousel">幻灯片</option>
                                        <option value="glue">胶水</option>
                                        <option value="push">推动</option>
                                        <option value="pull">拉动</option>
                                        <option value="fold">折叠</option>
                                        <option value="unfold">展开</option>
                                        <option value="room">room</option>
                                        <option value="cube">cube</option>
                                        <option value="sides">sides</option>
                                        <option value="slide">slide</option>
                                        <option value="move-fade">move-fade</option>
                                        <option value="scale-up-up">scale-up-up</option>
                                        <option value="scale-down-up">scale-down-up</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 预览 -->
        <div id="display" class="display">
            <div class="display-mask"></div>
            <div id="display-device" class="display-device">
                <article id="display-list" class="display-list">
                    <li class="display-item item1">1</li>
                    <li class="display-item item2">2</li>
                    <li class="display-item item3">3</li>
                    <li class="display-item item4">4</li>
                </article>
            </div>
            <div class="display-tool">
                <div class="display-control">
                </div>
            </div>
            <ul class="display-tools">
                <li class="tool-item"><i id="display-prev" class="icon icon-left"></i></li>
                <li class="tool-item"><i id="display-next" class="icon icon-right"></i></li>
                <li class="tool-item"><i id="display-close" class="icon icon-close"></i></li>
            </ul>
            <div class="display-progress">
                <div id="display-progress-bar" class="display-progress-bar"></div>
            </div>
        </div>
        <!-- 查看所有幻灯片 -->
        <ul class="all-list">
            <li></li>
        </ul>
        <!-- 替换图片对话框 -->
        <div id="image-select-dialog" class="modal fade">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
                        <h4 class="modal-title">选择图片</h4>
                    </div>
                    <div class="modal-body">
                        <div id="">

                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal">确定</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="image-selector" class="image-selector">
            <ul class="nav image-tab">
                <li class="nav-item active"><a class="nav-link" href="#tab1" data-toggle="tab">上传</a></li>
                <li class="nav-item"><a class="nav-link" href="#tab2" data-toggle="tab">背景</a></li>
                <li class="nav-item"><a class="nav-link" href="#tab3" data-toggle="tab">图片</a></li>
            </ul>
            <div class="tab-content image-tab-content">
                <div id="tab1" class="tab-pane fade in active">
                    <div id="drop-area" class="drop-area">
                        <a id="upload" class="btn btn-primary">上传图片</a>
                        <div class="tip">可将图片拖拽到这里或者直接将图片拖到编辑区</div>
                    </div>
                    <div class="network-img">
                        <input id="image-selector-url" class="form-control" placeholder="网络图片地址">
                        <button id="image-selector-insert" class="btn btn-default" type="button">插入图片</button>
                    </div>
                </div>
                <div id="tab2" class="tab-pane fade">
                    <ul id="select-img-list" class="select-img-list">
                        <li class="select-img-item">
                            <img src="/static/img/tpl/bg0.jpg">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/tpl/bg1.jpg">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/tpl/bg2.jpg">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/tpl/bg3.jpg">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/tpl/bg4.jpg">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/tpl/bg5.jpg">
                        </li>
                    </ul>
                </div>
                <div id="tab3" class="tab-pane fade">
                    <ul id="select-img-list2" class="select-img-list">
                        <li class="select-img-item">
                            <img src="/static/img/image-1-1.png">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/image-1-2.png">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/image-1-3.png">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/image-1-4.png">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/image-1-5.png">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/image-1-6.png">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/tpl/img1.png">
                        </li>
                        <li class="select-img-item">
                            <img src="/static/img/tpl/img2.png">
                        </li>
                    </ul>
                </div>
            </div>

        </div>
        <!-- 元素右键菜单 -->
        <ul id="elem-menu" class="elem-menu dropdown-menu">
            <li><a id="elem-menu-cut" href="#">剪切（Ctrl + X）</a></li>
            <li><a id="elem-menu-copy" href="#">复制（Ctrl + C）</a></li>
            <li><a id="elem-menu-paste" href="#">粘贴（Ctrl + V）</a></li>
            <li class="divider"></li>
            <li><a id="elem-menu-move-front" href="#">置于顶层</a></li>
            <li><a id="elem-menu-move-behind" href="#">置于底层</a></li>
            <li><a id="elem-menu-move-up" href="#">上移一层</a></li>
            <li><a id="elem-menu-move-down" href="#">下移一层</a></li>
            <li class="divider"></li>
            <li><a id="elem-menu-delete" href="#">删除</a></li>
        </ul>
        <ul id="display-menu" class="dropdown-menu">
            <li><a id="display-menu-all" href="#">查看所有幻灯片</a></li>
            <li><a id="display-menu-close" href="#">结束放映</a></li>
        </ul>
        <!-- 编辑器右键菜单 -->
        <ul id="editor-menu" class="dropdown-menu">
            <li><a id="editor-menu-paste" href="#">粘贴</a></li>
        </ul>
        <!-- 左侧预览菜单 -->
        <ul id="preview-menu" class="dropdown-menu">
            <li><a id="preview-paste" href="#">粘贴</a></li>
            <li><a id="preview-add" href="#">添加</a></li>
        </ul>
        <ul id="preview-item-menu" class="dropdown-menu">
            <li><a id="preview-menu-cut" href="#">剪切<span class="dropdown-menu-tip">Ctrl + C</span></a></li>
            <li><a id="preview-menu-copy" href="#">复制<span class="dropdown-menu-tip">Ctrl + C</span></a></li>
            <li><a id="preview-menu-paste" href="#">粘贴<span class="dropdown-menu-tip">Ctrl + V</span></a></li>
            <li><a id="preview-menu-add" href="#">添加</a></li>
            <li class="divider"></li>
            <li><a id="preview-menu-delete" href="#">删除<span class="dropdown-menu-tip">Delete</span></a></li>
        </ul>
        <!-- 拖拽时的辅助线 -->
        <div id="guide-h" class="guide"></div>
        <div id="guide-v" class="guide"></div>
        <!-- 插入形状 -->
        <div id="shape-box" class="shape-box">
            <div class="title">基本形状</div>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,1)" fill="rgba(0,0,0,0)" stroke-width="2px" version="1.1" type="svg_template" id="arrow" targetType="svg_shape"><g><path d="M 1,15 30,15 30,5 39,20 30,35 30,25 1,25 Z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,1)" fill="rgba(0,0,0,0)" stroke-width="2px" version="1.1" type="svg_template" id="doubleArrow" targetType="svg_shape"><g><path d="M 7,5 7,15 33,15 33,5 39,20 33,35 33,25 7,25 7,35 1,20 Z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="2px" version="1.1" type="svg_template" id="line" targetType="svg_shape"><g><path d="M4,18 36,18 36,22 4,22Z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,1)" fill="rgba(0,0,0,0)" stroke-width="2px" version="1.1" type="svg_template" id="square" targetType="svg_shape"><g><path d="M2,2 38,2 38,38 2,38z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,1)" fill="rgba(0,0,0,0)" stroke-width="2px" version="1.1" type="svg_template" id="triangle" targetType="svg_shape"><g><path d="M20,2 38,38 2,38z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,1)" fill="rgba(0,0,0,0)" stroke-width="2px" version="1.1" type="svg_template" id="circle" targetType="svg_shape"><g><path d="M 20,2 A 13,13, 0, 0, 0, 20,38  A 13,13, 0, 0, 0, 20,2Z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,1)" fill="rgba(0,0,0,0)" stroke-width="2px" version="1.1" type="svg_template" id="circle2" targetType="svg_shape"><g><path d="M 2,20 A 18,10, 0, 1, 1, 38,20  A 18,10, 0, 1, 1, 2,20Z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,1)" fill="rgba(0,0,0,0)" stroke-width="2px" version="1.1" type="svg_template" id="tip" targetType="svg_shape"><g><path d="M2,2 38,2 38,28 12,28 5,38 6,28 2,28z"></path></g></svg>
            <div class="title">复杂形状</div>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="?" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466z M17.328,24.371h-2.707v-2.596h2.707V24.371zM17.328,19.003v0.858h-2.707v-1.057c0-3.19,3.63-3.696,3.63-5.963c0-1.034-0.924-1.826-2.134-1.826c-1.254,0-2.354,0.924-2.354,0.924l-1.541-1.915c0,0,1.519-1.584,4.137-1.584c2.487,0,4.796,1.54,4.796,4.136C21.156,16.208,17.328,16.627,17.328,19.003z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="i" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466z M14.757,8h2.42v2.574h-2.42V8z M18.762,23.622H16.1c-1.034,0-1.475-0.44-1.475-1.496v-6.865c0-0.33-0.176-0.484-0.484-0.484h-0.88V12.4h2.662c1.035,0,1.474,0.462,1.474,1.496v6.887c0,0.309,0.176,0.484,0.484,0.484h0.88V23.622z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="$" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466z M17.255,23.88v2.047h-1.958v-2.024c-3.213-0.44-4.621-3.08-4.621-3.08l2.002-1.673c0,0,1.276,2.223,3.586,2.223c1.276,0,2.244-0.683,2.244-1.849c0-2.729-7.349-2.398-7.349-7.459c0-2.2,1.738-3.785,4.137-4.159V5.859h1.958v2.046c1.672,0.22,3.652,1.1,3.652,2.993v1.452h-2.596v-0.704c0-0.726-0.925-1.21-1.959-1.21c-1.32,0-2.288,0.66-2.288,1.584c0,2.794,7.349,2.112,7.349,7.415C21.413,21.614,19.785,23.506,17.255,23.88z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="arrowleftalt" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M16,30.534c8.027,0,14.534-6.507,14.534-14.534c0-8.027-6.507-14.534-14.534-14.534C7.973,1.466,1.466,7.973,1.466,16C1.466,24.027,7.973,30.534,16,30.534zM18.335,6.276l3.536,3.538l-6.187,6.187l6.187,6.187l-3.536,3.537l-9.723-9.724L18.335,6.276z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="arrowalt" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM13.665,25.725l-3.536-3.539l6.187-6.187l-6.187-6.187l3.536-3.536l9.724,9.723L13.665,25.725z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="!" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M26.711,14.086L16.914,4.29c-0.778-0.778-2.051-0.778-2.829,0L4.29,14.086c-0.778,0.778-0.778,2.05,0,2.829l9.796,9.796c0.778,0.777,2.051,0.777,2.829,0l9.797-9.797C27.488,16.136,27.488,14.864,26.711,14.086zM14.702,8.981c0.22-0.238,0.501-0.357,0.844-0.357s0.624,0.118,0.844,0.353c0.221,0.235,0.33,0.531,0.33,0.885c0,0.306-0.101,1.333-0.303,3.082c-0.201,1.749-0.379,3.439-0.531,5.072H15.17c-0.135-1.633-0.301-3.323-0.5-5.072c-0.198-1.749-0.298-2.776-0.298-3.082C14.372,9.513,14.482,9.22,14.702,8.981zM16.431,21.799c-0.247,0.241-0.542,0.362-0.885,0.362s-0.638-0.121-0.885-0.362c-0.248-0.241-0.372-0.533-0.372-0.876s0.124-0.638,0.372-0.885c0.247-0.248,0.542-0.372,0.885-0.372s0.638,0.124,0.885,0.372c0.248,0.247,0.372,0.542,0.372,0.885S16.679,21.558,16.431,21.799z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="?2" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M26.711,14.086L16.914,4.29c-0.778-0.778-2.051-0.778-2.829,0L4.29,14.086c-0.778,0.778-0.778,2.05,0,2.829l9.796,9.796c0.778,0.777,2.051,0.777,2.829,0l9.797-9.797C27.488,16.136,27.488,14.864,26.711,14.086zM16.431,21.799c-0.248,0.241-0.543,0.362-0.885,0.362c-0.343,0-0.638-0.121-0.886-0.362c-0.247-0.241-0.371-0.533-0.371-0.876s0.124-0.638,0.371-0.885c0.248-0.248,0.543-0.372,0.886-0.372c0.342,0,0.637,0.124,0.885,0.372c0.248,0.247,0.371,0.542,0.371,0.885S16.679,21.558,16.431,21.799zM18.911,15.198c-0.721,0.716-1.712,1.147-2.972,1.294v2.027h-0.844v-3.476c0.386-0.03,0.768-0.093,1.146-0.188c0.38-0.095,0.719-0.25,1.019-0.464c0.312-0.227,0.555-0.5,0.729-0.822c0.174-0.322,0.261-0.77,0.261-1.346c0-0.918-0.194-1.623-0.582-2.113c-0.389-0.49-0.956-0.735-1.701-0.735c-0.281,0-0.527,0.042-0.738,0.124s-0.366,0.16-0.464,0.234c0.031,0.146,0.072,0.357,0.124,0.633c0.052,0.275,0.078,0.486,0.078,0.633c0,0.226-0.098,0.433-0.294,0.619c-0.195,0.187-0.479,0.28-0.853,0.28c-0.33,0-0.565-0.113-0.706-0.339s-0.211-0.489-0.211-0.789c0-0.244,0.067-0.484,0.201-0.72c0.135-0.235,0.346-0.463,0.633-0.684c0.245-0.195,0.577-0.364,0.995-0.504c0.419-0.141,0.854-0.211,1.308-0.211c0.647,0,1.223,0.103,1.724,0.308c0.502,0.205,0.914,0.479,1.238,0.822c0.337,0.355,0.586,0.755,0.748,1.198c0.162,0.444,0.243,0.926,0.243,1.446C19.994,13.558,19.633,14.482,18.911,15.198z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="stopsign" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M20.833,2.625H10.167l-7.542,7.542v10.666l7.542,7.542h10.666l7.542-7.542V10.167L20.833,2.625zM23.76,17.145c-0.461,0.432-0.496-0.021-1.151,0.385c-0.655,0.404-1.067,0.844-1.067,0.844l-0.578,0.564c0,0-1.199,1.422-1.59,1.717c-0.392,0.291-0.572,0.166-0.572,0.166c-0.133,0.23-0.641,0.656-1.193,1.025c-0.549,0.371-0.99,1.354-0.99,1.354l-0.208,1.465c0,0-1.597,0.021-3.096-0.293c-1.499-0.314-2.699-0.982-2.699-0.982l0.655-1.451c0,0-0.58-2.225-0.636-3.926c-0.056-1.703,0.572-2.958,0.481-3.37c-0.09-0.412-0.438-1.109-0.523-1.569c-0.083-0.46-0.307-2.036-0.327-2.238c-0.021-0.202-0.28-2.232,0.614-2.204c0.891,0.027,0.648,1.388,0.725,2.246c0.077,0.857,1.13,3.249,1.297,3.123c0.167-0.125-0.056-2.398,0.006-2.838c0.063-0.439,0.182-2.315,0.293-2.747c0.112-0.433,0.105-1.778,0.935-1.66c0.83,0.118,0.606,1.332,0.488,1.813c-0.118,0.48,0.021,1.597,0.07,2.302c0.048,0.704,0.112,2.356,0.112,2.356l0.404-0.042c0,0,0.913-5,0.976-5.439c0.062-0.439,0.182-1.618,0.858-1.472c1.117,0.242,0.516,1.967,0.516,1.967l-0.486,5.509c0,0,0.166,0.224,0.492,0.021c0.33-0.202,1.312-3.25,1.459-3.927c0.146-0.676,0.084-2.678,1.145-2.428c1.059,0.252,0.453,2.755,0.124,4.353c-0.327,1.597-1.03,3.39-1.03,3.39l-0.433,1.631l0.376,0.852l0.412-0.092l0.898-0.717c0,0,0,0,0.614-0.461c0.613-0.46,1.764-0.495,2.044-0.355C23.453,16.154,24.221,16.713,23.76,17.145z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="temp" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M17.5,19.508V8.626h-3.999v10.881c-1.404,0.727-2.375,2.178-2.375,3.869c0,2.416,1.959,4.375,4.375,4.375s4.375-1.959,4.375-4.375C19.876,21.686,18.905,20.234,17.5,19.508zM20.5,5.249c0-2.757-2.244-5-5.001-5s-4.998,2.244-4.998,5v12.726c-1.497,1.373-2.376,3.314-2.376,5.4c0,4.066,3.31,7.377,7.376,7.377s7.374-3.311,7.374-7.377c0-2.086-0.878-4.029-2.375-5.402V5.249zM20.875,23.377c0,2.963-2.41,5.373-5.375,5.373c-2.962,0-5.373-2.41-5.373-5.373c0-1.795,0.896-3.443,2.376-4.438V5.251c0-1.654,1.343-3,2.997-3s3,1.345,3,3v13.688C19.979,19.934,20.875,21.582,20.875,23.377zM22.084,8.626l4.5,2.598V6.029L22.084,8.626z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="thunder" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M25.371,7.306c-0.092-3.924-3.301-7.077-7.248-7.079c-2.638,0.001-4.942,1.412-6.208,3.517c-0.595-0.327-1.28-0.517-2.01-0.517C7.626,3.229,5.772,5.033,5.689,7.293c-2.393,0.786-4.125,3.025-4.127,5.686c0,3.312,2.687,6,6,6v-0.002h5.271l-2.166,3.398l1.977-0.411L10,30.875l9.138-10.102L17,21l2.167-2.023h4.269c3.312,0,6-2.688,6-6C29.434,10.34,27.732,8.11,25.371,7.306zM23.436,16.979H7.561c-2.209-0.006-3.997-1.792-4.001-4.001c-0.002-1.982,1.45-3.618,3.35-3.931c0.265-0.043,0.502-0.191,0.657-0.414C7.722,8.41,7.779,8.136,7.73,7.87C7.702,7.722,7.685,7.582,7.685,7.446C7.689,6.221,8.68,5.23,9.905,5.228c0.647,0,1.217,0.278,1.633,0.731c0.233,0.257,0.587,0.375,0.927,0.309c0.342-0.066,0.626-0.307,0.748-0.63c0.749-1.992,2.662-3.412,4.911-3.41c2.899,0.004,5.244,2.35,5.251,5.249c0,0.161-0.009,0.326-0.027,0.497c-0.049,0.517,0.305,0.984,0.815,1.079c1.86,0.344,3.274,1.966,3.271,3.923C27.43,15.186,25.645,16.973,23.436,16.979z"></path></g></svg>
            <svg width="100%" height="100%" viewBox="0 0 40 40" stroke="rgba(0,0,0,0)" fill="rgba(0,0,0,1)" stroke-width="1px" version="1.1" type="svg_template" id="snow" targetType="svg_icon"><g transform="scale(1.2,1.2)"><path d="M25.372,6.912c-0.093-3.925-3.302-7.078-7.248-7.08c-2.638,0.002-4.942,1.412-6.208,3.518c-0.595-0.327-1.28-0.518-2.01-0.518C7.627,2.834,5.773,4.639,5.69,6.898c-2.393,0.786-4.125,3.025-4.127,5.686c0,3.312,2.687,6,6,6v-0.002h15.875c3.312,0,6-2.688,6-6C29.434,9.944,27.732,7.715,25.372,6.912zM23.436,16.584H7.562c-2.209-0.006-3.997-1.793-4.001-4c-0.002-1.983,1.45-3.619,3.35-3.933c0.265-0.043,0.502-0.19,0.657-0.414C7.723,8.015,7.78,7.74,7.731,7.475C7.703,7.326,7.686,7.187,7.686,7.051c0.004-1.225,0.995-2.217,2.22-2.219c0.647,0,1.217,0.278,1.633,0.731c0.233,0.257,0.587,0.375,0.927,0.31c0.342-0.066,0.626-0.308,0.748-0.631c0.749-1.992,2.662-3.412,4.911-3.41c2.898,0.004,5.244,2.351,5.251,5.25c0,0.16-0.009,0.325-0.026,0.496c-0.05,0.518,0.305,0.984,0.814,1.079c1.859,0.345,3.273,1.966,3.271,3.923C27.43,14.791,25.645,16.578,23.436,16.584zM16.667,24.09l1.119-1.119c0.389-0.391,0.389-1.025,0-1.416c-0.392-0.391-1.025-0.391-1.415,0l-1.119,1.119l-1.119-1.119c-0.391-0.391-1.025-0.391-1.415,0c-0.391,0.391-0.391,1.025,0,1.416l1.118,1.117l-1.12,1.121c-0.389,0.393-0.389,1.021,0,1.414c0.195,0.188,0.451,0.293,0.707,0.293c0.256,0,0.512-0.104,0.708-0.293l1.12-1.119l1.12,1.119c0.195,0.188,0.451,0.293,0.708,0.293c0.256,0,0.512-0.104,0.707-0.293c0.391-0.396,0.391-1.021,0-1.414L16.667,24.09zM25.119,21.817c-0.393-0.392-1.025-0.392-1.415,0l-1.12,1.121l-1.12-1.121c-0.391-0.392-1.022-0.392-1.414,0c-0.39,0.392-0.39,1.022,0,1.416l1.119,1.119l-1.119,1.119c-0.39,0.391-0.39,1.022,0,1.413c0.195,0.195,0.451,0.294,0.707,0.294c0.257,0,0.513-0.099,0.707-0.294l1.12-1.118l1.12,1.118c0.194,0.195,0.45,0.294,0.707,0.294c0.256,0,0.513-0.099,0.708-0.294c0.389-0.391,0.389-1.022,0-1.413l-1.12-1.119l1.12-1.119C25.507,22.842,25.507,22.209,25.119,21.817zM9.334,23.953l1.119-1.119c0.389-0.394,0.389-1.021,0-1.414c-0.391-0.394-1.025-0.394-1.415,0l-1.119,1.119l-1.12-1.121c-0.391-0.39-1.023-0.39-1.415,0c-0.391,0.396-0.391,1.024,0,1.418l1.119,1.117l-1.12,1.118c-0.391,0.394-0.391,1.025,0,1.414c0.196,0.195,0.452,0.293,0.708,0.293c0.256,0,0.511-0.098,0.707-0.293l1.12-1.119l1.121,1.121c0.195,0.195,0.451,0.293,0.707,0.293s0.513-0.098,0.708-0.293c0.389-0.391,0.389-1.022,0-1.416L9.334,23.953z"></path></g></svg>
        </div>
        <!-- 文字编辑框 -->
        <div id="text-dialog" class="text-dialog">
            <div id="text-dialog-text" class="form-control text" rows=5></div>
        </div>
        <div id="table-dialog" class="table-dialog">
            <div style="font-size: 14px; color: #666; text-align:right;">
                <table id="choose-table" class="choose-table">
                    <tbody>
                    <tr index="1">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="2">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="3">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="4">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="5">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="6">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="7">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="8">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="9">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="10">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="11">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="12">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="13">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="14">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    <tr index="15">
                        <td index="1" class=""></td>
                        <td index="2" class=""></td>
                        <td index="3" class=""></td>
                        <td index="4" class=""></td>
                        <td index="5" class=""></td>
                        <td index="6" class=""></td>
                        <td index="7" class=""></td>
                        <td index="8" class=""></td>
                        <td index="9" class=""></td>
                        <td index="10" class=""></td>
                        <td index="11" class=""></td>
                        <td index="12" class=""></td>
                        <td index="13" class=""></td>
                        <td index="14" class=""></td>
                        <td index="15" class=""></td>
                        <td index="16" class=""></td>
                        <td index="17" class=""></td>
                        <td index="18" class=""></td>
                        <td index="19" class=""></td>
                        <td index="20" class=""></td>
                    </tr>
                    </tbody>
                </table>
                <span id="row">0</span><span> 行 </span><span id="col">0</span><span> 列</span></div>
        </div>

        <div id="color-dialog" class="color-dialog">
            <div id="color-dialog-color" class="left"></div>
            <div class="settings">
                <div class="setting">
                    <div id="color-preview" class="color-preview">
                    </div>
                </div>
                <div class="setting">
                    <div class="hex">
                        <h3 class="title">Hex</h3>
                        <input id="hex" class="form-control">
                    </div>
                </div>
                <div class="setting">
                    <h3 class="title">RGB</h3>
                    <div class="rgbs">
                        <div class="rgb">
                            <input id="rgb-r" class="form-control" type="number" min="0" max="255">
                            <div class="text">R</div>
                        </div>
                        <div class="rgb">
                            <input id="rgb-g" class="form-control" type="number" min="0" max="255">
                            <div class="text">G</div>
                        </div>
                        <div class="rgb">
                            <input id="rgb-b" class="form-control" type="number" min="0" max="255">
                            <div class="text">B</div>
                        </div>
                    </div>

                </div>
                <div class="setting">
                    <h3 class="title">HSL</h3>
                    <div class="rgbs">
                        <div class="rgb">
                            <input id="hsl-h" class="form-control" type="number" min="0" max="360">
                            <div class="text">H</div>
                        </div>
                        <div class="rgb">
                            <input id="hsl-s" class="form-control" type="number" min="0" max="100">
                            <div class="text">S</div>
                        </div>
                        <div class="rgb">
                            <input id="hsl-b" class="form-control" type="number" min="0" max="100">
                            <div class="text">B</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div id="link-dialog" class="link-dialog">
            <div class="form-horizontal">
                <div class="form-group">
                    <label class="control-label">文字</label>
                    <input id="link-dialog-text" class="form-control">
                </div>
                <div class="form-group">
                    <label class="control-label">链接</label>
                    <input id="link-dialog-url" class="form-control" placeholder="http://">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    const Intent = window.Intent

    export default {
        data () {
            return {
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            selectTemplate(asd) {
                alert(asd)
            },
            about() {
                ui.alert('Slides v17.4.0')
            },
            init() {
                let editor = new SliderEditor('#demo', {
                })
                this.editor = editor

                // 预览菜单
                $('#display').contextmenu({
                    content: '#display-menu'
                });

                // 全屏
                var isFullScreen = false;

                function fullElem(docElm) {
                    if (docElm.requestFullscreen) {
                        docElm.requestFullscreen();
                    } else if (docElm.msRequestFullscreen) {
                        docElm.msRequestFullscreen();
                    } else if (docElm.mozRequestFullScreen) {
                        docElm.mozRequestFullScreen();
                    } else if (docElm.webkitRequestFullScreen) {
                        docElm.webkitRequestFullScreen();
                    }
                }

                $("#fullscreen").click(function () {
                    //var docElm = document.documentElement;
                    var docElm = document.getElementById('editor');

                    if (!isFullScreen) {
                        $(this).text('取消全屏');
                        isFullScreen = true;
                        // 全屏播放
                        fullElem(document.documentElement);
                    } else {
                        $(this).text('全屏');
                        isFullScreen = false;
                        // 取消全屏
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.msExitFullscreen) {
                            document.msExitFullscreen();
                        } else if (document.mozCancelFullScreen) {

                            document.mozCancelFullScreen();
                        } else if (document.webkitCancelFullScreen) {
                            document.webkitCancelFullScreen();
                        }
                    }
                });

                document.addEventListener("fullscreenchange, webkitfullscreenchange", function () {
                    alert(1);
                    var isFullscreen = document.fullscreenEnabled ||

                            window.fullScreen ||

                            document.webkitIsFullScreen ||

                            document.msFullscreenEnabled;

//注意：要在用户授权全屏后才能准确获取当前的状态
                });

                //document.fullscreenElement document.msFullscreenElement

                //$('#tab-index').tab('show');
//
// document.mozFullScreen document.webkitIsFullScreen

                //ui.color();
                $("[data-toggle='tooltip']").tooltip(); // TODO
            },
            selectImage() {
                let intent = new Intent({
                    action: 'http://webintent.yunser.com/pick',
                    type: 'image/*'
                })
                navigator.startActivity(intent, data => {
                    console.log('成功了')
                    this.editor.insertImage(data)
                }, data => {
                    console.log('失败')
                })
            },
            replaceImage() {
                let dataUrl = this.editor.$curElem.find('.elem-content').attr('src')
                let intent = new Intent({
                    action: 'http://webintent.yunser.com/pick',
                    type: 'image/*',
                    data: dataUrl
                })
                navigator.startActivity(intent, data => {
                    console.log('成功了')
                    this.editor.$curElem.find('.elem-content').attr('src', data)
                }, data => {
                    console.log('失败')
                })
            }
        }
    }
</script>

<style scoped>

</style>
