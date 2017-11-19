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
                                <!--<li><a href="help.html">帮助页面</a></li>-->
                                <li><a id="key" href="#">快捷键</a></li>
                                <li><a id="about" href="#">关于</a></li>
                            </ul>
                        </li>
                        <li class="nav-item navbar-form">
                            <button id="help" class="btn btn-info" href="#">快速导航</button>
                        </li>
                        <li class="nav-item navbar-form">
                            <button class="btn btn-info" @click="test">测试一下</button>
                        </li>
                    </ul>
                    <ul class="nav navbar-nav pull-right">
                        <li class="nav-item navbar-form">
                            <a id="display-show" class="btn btn-default">预览</a>
                            <a id="fullscreen" class="btn btn-default">全屏</a>
                        </li>

                        <li class="nav-item"><a class="nav-link" href="/" target="_blank">更多工具</a> </li>
                    </ul>
                </div>
            </div>
        </header>
        <!-- /头部 -->
        <div class="layout-body">
            <div class="layout-content">
                关于
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
            }
        },
        methods: {
            test() {
                alert(1)
            }
        }
    }
</script>

<style scoped>

</style>
