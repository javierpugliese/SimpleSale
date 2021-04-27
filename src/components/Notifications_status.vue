<template>

    <div class="ntf" v-bind:class="[this.$store.state.notifications.view ? 'ntf-act' : '']">

        <div class="ntf-tp" @click="this.closeBox">Ocultar</div>

        <div class="ntf-md" v-if="this.$store.state.notifications.content.length > 0">

            <div class="ntf-md-it" v-bind:class="['ntf-md-it-'+notification.type]"
            v-for="(notification, index) in this.$store.state.notifications.content"
            v-bind:key="`notification-${index}`">

                <div class="ntf-md-it-tp">

                    <div class="ntf-md-it-tp-tx">{{notification.title}}</div>

                    <div class="ntf-md-it-tp-btn" @click="deleteNotification(index)">
                        <i class="ntf-md-it-tp-btn-i fas fa-times"></i>
                    </div>

                </div>

                <div class="ntf-md-it-ct">{{notification.content}}</div>

            </div>

        </div>

        <div class="ntf-md2" v-else>
            <div class="ntf-md2-alr">Veras tus notificaciónes en esta sección</div>
        </div>

        <!-- <div class="ntf-bt">
            <div class="ntf-bt-tx">Limpiar notificaciónes</div>
        </div> -->

    </div>
    
</template>


<script>

    export default {

        name: 'Notifications_status',

        methods: {

            closeBox() {

                this.$store.commit( 'closeBoxNotifications' );

            },

            deleteNotification( index ) {

                console.log( index );

                this.$store.commit( 'deleteNotification', index );

            }

        },

        mounted() {

            for( let i = 0; i < 0; i++ ) {

                this.$store.commit( 'addNotification', {
                    title: 'Title '+i,
                    content: 'Esto es una notificación'
                })

            }
            
        }
        
    }


</script>


<style lang="scss">

    .ntf {
        position: fixed;
        display: grid;
        grid-template-rows: 48px auto;
        align-items: flex-end;
        top: 0;
        right: -304px;
        width: 304px;
        height: 100vh;
        z-index: 1000;
        background: hsla(0, 0%, 20%, .95);
        backdrop-filter: blur(5px);
        box-shadow: 0 0 8px 8px hsla(0, 0%, 10%, .5);
        overflow: hidden;
        transition: all .15s;

        &-tp {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 48px;
            text-align: center;
            // background: red;
            z-index: 100;
            // border-bottom: 1px solid hsl(0, 0%, 30%);
            box-shadow: 0 0 16px 16px hsla(0, 0%, 10%, .3);
            user-select: none;
            cursor: pointer;
            background: hsl(0, 0%, 20%);
            transition: all .1s;

            &:hover {
                background: hsl(0, 0%, 30%);
            }

        }

        &-md {
            display: flex;
            flex-direction: column-reverse;
            // align-content: flex-end;
            overflow-y: auto;
            height: 100%;

            /* width */
            &::-webkit-scrollbar {
                width: 10px;
            }

            /* Track */
            &::-webkit-scrollbar-track {
                background: transparent;
            }

            /* Handle */
            &::-webkit-scrollbar-thumb {
                background: hsl(0, 0%, 40%);
                border: 2px solid hsl(0, 0%, 20%);
                // border-radius: 4px;
            }

            /* Handle on hover */
            &::-webkit-scrollbar-thumb:hover {
                background: hsl(0, 0%, 60%);
            }

            &-it {
                border-top: 1px solid hsl(0, 0%, 25%);
                padding: 12px 8px;

                &-tp {
                    display: grid;
                    grid-template-columns: auto 32px;
                    align-items: center;
                    padding-bottom: 4px;

                    &-tx {
                        font-size: 15px;
                        font-weight: 400;
                    }

                    &-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 32px;
                        height: 32px;
                        cursor: pointer;
                        border-radius: 50%;
                        transition: .1s;

                        &:hover {
                            background: hsl(0, 0%, 30%);
                        }

                        &-i {
                            font-size: 12px;
                            font-weight: 100;
                        }

                    }

                }

                &-ct {
                    font-size: 15px;
                    font-weight: 100;
                }

                &-error {
                    background: hsla(350, 100%, 50%, .15);
                }

            }

        }

        &-md2 {
            display: grid;
            // align-content: flex-end;
            // overflow-y: auto;
            height: 100%;

            &-alr {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                font-size: 24px;
                font-weight: 100;
                text-align: center;
                padding: 0 26px;
                color: hsl(0, 0%, 60%);
            }

        }

        &-act {
            right: 0;
        }

    }

</style>