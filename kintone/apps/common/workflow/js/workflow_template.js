/** **************************************************************
 * kintone : ワークフロー - Template
 * Customize JavaScript File
 * @author : Tanaka
 ****************************************************************/
const isMobile = (eventType) => {
    if (eventType) {
        return /^mobile\./.test(eventType);
    }
    return kintone.app.getId() === null;
};

/*
* ---------------------------------------
* 承認ルート skipチェック時 承認ユーザ無効化
* @device: PC, mobile
* ---------------------------------------
*/
(() => {
    'use strict';
    const events = [
        'app.record.create.show',
        'app.record.edit.show',
        'mobile.app.record.create.show',
        'mobile.app.record.edit.show',
        'app.record.create.change.check_skip_authorizer_1',
        'app.record.create.change.check_skip_authorizer_2',
        'app.record.create.change.check_skip_authorizer_3',
        'app.record.create.change.check_skip_authorizer_4',
        'app.record.create.change.check_skip_authorizer_5',
        'app.record.create.change.check_skip_authorizer_6',
        'app.record.edit.change.check_skip_authorizer_1',
        'app.record.edit.change.check_skip_authorizer_2',
        'app.record.edit.change.check_skip_authorizer_3',
        'app.record.edit.change.check_skip_authorizer_4',
        'app.record.edit.change.check_skip_authorizer_5',
        'app.record.edit.change.check_skip_authorizer_6',
        'mobile.app.record.create.change.check_skip_authorizer_1',
        'mobile.app.record.create.change.check_skip_authorizer_2',
        'mobile.app.record.create.change.check_skip_authorizer_3',
        'mobile.app.record.create.change.check_skip_authorizer_4',
        'mobile.app.record.create.change.check_skip_authorizer_5',
        'mobile.app.record.create.change.check_skip_authorizer_6',
        'mobile.app.record.edit.change.check_skip_authorizer_1',
        'mobile.app.record.edit.change.check_skip_authorizer_2',
        'mobile.app.record.edit.change.check_skip_authorizer_3',
        'mobile.app.record.edit.change.check_skip_authorizer_4',
        'mobile.app.record.edit.change.check_skip_authorizer_5',
        'mobile.app.record.edit.change.check_skip_authorizer_6',
    ];
    kintone.events.on(events, (event) => {
        const record = event.record;
        const checkSkip1 = record.check_skip_authorizer_1.value;
        const checkSkip2 = record.check_skip_authorizer_2.value;
        const checkSkip3 = record.check_skip_authorizer_3.value;
        const checkSkip4 = record.check_skip_authorizer_4.value;
        const checkSkip5 = record.check_skip_authorizer_5.value;
        const checkSkip6 = record.check_skip_authorizer_6.value;
        if (checkSkip1.length === 1) {
            record.authorized_user_1.disabled = true;
        } else {
            record.authorized_user_1.disabled = false;
        }

        if (checkSkip2.length === 1) {
            record.authorized_user_2.disabled = true;
        } else {
            record.authorized_user_2.disabled = false;
        }

        if (checkSkip3.length === 1) {
            record.authorized_user_3.disabled = true;
        } else {
            record.authorized_user_3.disabled = false;
        }

        if (checkSkip4.length === 1) {
            record.authorized_user_4.disabled = true;
        } else {
            record.authorized_user_4.disabled = false;
        }

        if (checkSkip5.length === 1) {
            record.authorized_user_5.disabled = true;
        } else {
            record.authorized_user_5.disabled = false;
        }

        if (checkSkip6.length === 1) {
            record.authorized_user_6.disabled = true;
        } else {
            record.authorized_user_6.disabled = false;
        }
        return event;
    })
})();

/*
* ---------------------------------------
* プロセス管理「取下げ」非表示
* @device: PC, mobile
* ---------------------------------------
*/
(() => {
    'use strict';
    const events = [
        'app.record.detail.show',
        'mobile.app.record.index.show'
    ];
    kintone.events.on(events, (event) => {
        const record = event.record;
        const withdrawalButton = document.querySelector('.gaia-app-statusbar-action-label[title="取下げ"]');
        if (withdrawalButton) {
            withdrawalButton.closest('.gaia-app-statusbar-action').style.display = 'none';
        }
        return event;
    })
})();

/*
* ---------------------------------------
* 代理承認機能
* @device: PC todo:mobile
* ---------------------------------------
*/
(() => {
    'use strict';
    const events = [
        'app.record.detail.show',
        'mobile.app.record.detail.show'
    ];
    kintone.events.on(events, (event) => {
        const path = '/k/v1/record/assignees.json';
        const record = event.record;
        const status = record['ステータス'].value;
        if (status !== '決裁') {
            const operator = record['作業者'].value[0].code;
            const loginUser = kintone.getLoginUser().code;
            const authArr = [];
            for (let i = 1; i < 7; i++) {
                authArr.push(record[`authorizer_${i}`].value);
            }
            if (authArr.includes(loginUser)) {
                if (authArr.indexOf(operator) < authArr.indexOf(loginUser)) {
                    const proxyApprovalBtn = document.createElement('button');
                    proxyApprovalBtn.id = 'proxy_approval_button';
                    proxyApprovalBtn.innerText = '代理承認';
                    // 代理承認ボタン押下時アクション
                    proxyApprovalBtn.onclick = async () => {
                        const body = {
                            app: 320, // todo
                            id: record.$id.value,
                            assignees: [loginUser]
                        };
                        try {
                            const res = await kintone.api(kintone.api.url(path, true), 'PUT', body);
                            console.log(res);
                            location.reload(true);
                        } catch (e) {
                            console.log(e);
                        }
                    };
                    let headerMenuSpace;
                    if (isMobile(event.type)) {
                        //headerMenuSpace = kintone.mobile.app.record.getHeaderMenuSpaceElement();
                    } else {
                        headerMenuSpace = kintone.app.record.getHeaderMenuSpaceElement();
                        headerMenuSpace.appendChild(headerMenuSpace.appendChild(proxyApprovalBtn));
                    }

                }
            }
        }
        return event;
    })
})();

/*
* ---------------------------------------
* プロセスアクション時 > コメント入力・履歴登録
* @device: PC
* ---------------------------------------
*/
(() => {
    'use strict';
    const events = [
        'app.record.detail.process.proceed',
        'mobile.app.record.detail.process.proceed'
    ];
    kintone.events.on(events, async (event) => {
        const record = event.record;
        const action = event.action.value;
        const nextStatus = event.nextStatus.value;
        const status = event.status.value;
        const comment = record.request_approval_comment.value;
        // ↓アプリごとに変更必要
        let appId;
        if (isMobile(event.type)) {
            appId = kintone.mobile.app.getId();
        } else {
            appId = kintone.app.getId();
        }

        let approvalHistory = '';
        if (nextStatus === '決裁') {
            approvalHistory = record.作業者.value[0].name + ' [' + status + '] ---> [' + nextStatus + ']';
        } else {
            if (extractNum(nextStatus)) {
                approvalHistory = record.作業者.value[0].name + ' [' + status + '] ---> ' + record[`authorized_user_${extractNum(nextStatus)}`].value[0].name + ' [' + nextStatus + ']';
            } else {
                approvalHistory = record.作業者.value[0].name + ' [' + status + '] ---> ' + record.作成者.value.name + ' [' + nextStatus + ']';
            }
        }

        const data = {
            'source_app_id': {
                value: appId
            },
            'source_application_id': {
                value: record.application_id.value
            },
            'source_record_id': {
                value: record.レコード番号.value
            },
            'approval_date': {
                value: formatDate(new Date())
            },
            'approval_action': {
                value: action
            },
            'approver_comment': {
                value: comment
            },
            'approval_status_history': {
                value: approvalHistory
            },
            'approver_user': {
                value: [{ code: record.作業者.value[0].code }]
            }
        };

        const params = {
            app: 324, // todo
            record: data,
        };

        try {
            await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', params);
        } catch (e) {
            console.log(e);
        }
        return event;
    })
})();

/*
* ---------------------------------------
* 新規作成時 承認ルートから承認者を決定
* @device: PC
* ---------------------------------------
*/
(() => {
    'use strict';
    const events = [
        'app.record.create.show',
        'mobile.app.record.create.show'
    ];

    // 部門長グループ
    const leaderOfDept = 'leader-of-dept';
    // 所属長グループ
    const headOfDept = 'head-of-dept';

    // エラータイトル
    const ET0001 = '承認経路が見つかりませんでした';
    const ET0002 = '役職内にメンバーが存在しませんでした';
    const ET0003 = '作成者の優先する組織が設定されていませんでした';
    // エラーメッセージ
    const EM0001 = '管理者に問い合わせをお願いします';

    kintone.events.on(events, async (event) => {

        // login user 取得
        const loginUserCode = kintone.getLoginUser().code;
        // appid 取得
        let appId;
        if (isMobile(event.type)) {
            appId = kintone.mobile.app.getId();
        } else {
            appId = kintone.app.getId();
        }
        const getPath = '/k/v1/records.json';
        const userApiPath = '/v1/users.json';
        const orgApiPath = '/v1/organizations.json';
        const orgUserApiPath = '/v1/organization/users.json';
        const usersInGroupPath = '/v1/group/users.json';
        const userGroupsPath = '/v1/user/groups.json';

        let authArr = [];
        let checkArr = [];
        let groupArr = [];

        try {
            const workflowBody = {
                app: '321',
                query: `target_app_id = ${appId}`,
                fields: [
                    'workflow_id',
                    'target_app_id',
                    'root_department',
                    'authorizer_1',
                    'authorizer_2',
                    'authorizer_3',
                    'authorizer_4',
                    'authorizer_5',
                    'authorizer_6',
                    'check_skip_authorizer_1',
                    'check_skip_authorizer_2',
                    'check_skip_authorizer_3',
                    'check_skip_authorizer_4',
                    'check_skip_authorizer_5',
                    'check_skip_authorizer_6',
                    'group_1',
                    'group_2',
                    'group_3',
                    'group_4',
                    'group_5',
                    'group_6'
                ]
            };

            const userReqParam = { codes: loginUserCode };

            // login user のグループを取得
            const userGroupsReqParam = { code: loginUserCode };

            await kintone.api(userGroupsPath, 'GET', userGroupsReqParam, async (resp) => {
                const groupsCodeArr = resp.groups.map(x => {
                    return x.code;
                })

                workflowBody.query += ' and root_department in (PRIMARY_ORGANIZATION())';

                // 取消申請画面へ遷移時 > 遷移前の承認経路にて承認ルート取得
                let beforeWorkflowKey = sessionStorage.getItem('beforeWorkflowKey');
                sessionStorage.removeItem('beforeWorkflowKey');
                if (beforeWorkflowKey) {
                    workflowBody.query = `workflow_lookup_key = "${beforeWorkflowKey}"`;
                    console.log(workflowBody.query);
                }

                // 承認経路の取得
                await kintone.api(getPath, 'GET', workflowBody, async (resp) => {
                    console.log(resp);
                    if (resp.records.length === 0) {
                        // 承認経路マスタから取得したデータが0件の場合
                        Swal.fire({
                            title: ET0001,
                            html: EM0001,
                            icon: 'error'
                        });
                        return;
                    }

                    // 承認経路マスタのlookup
                    let obj;
                    if (isMobile(event.type)) {
                        obj = kintone.mobile.app.record.get();
                    } else {
                        obj = kintone.app.record.get();
                    }
                    obj.record['approval_route_lookup'].value = resp.records[0]['workflow_id'].value;
                    obj.record['approval_route_lookup'].lookup = true;
                    if (isMobile(event.type)) {
                        kintone.mobile.app.record.set(obj);
                    } else {
                        kintone.app.record.set(obj);
                    }
                    // 承認者1~6の設定
                    for (let i = 1; i < 7; i++) {
                        authArr.push(resp.records[0][`authorizer_${i}`].value);
                        console.log(resp.records[0][`authorizer_${i}`].value[0]);
                        checkArr.push(resp.records[0][`check_skip_authorizer_${i}`].value);
                        groupArr.push(resp.records[0][`group_${i}`].value);
                    }

                    checkArr.forEach(async (x, i) => {
                        // kintoneフィールド情報を取得
                        if (x.length === 0) {
                            // スキップにチェックがついていない場合
                            if (authArr[i].length > 0) {
                                // 承認者が選択されている場合

                                let obj;
                                if (isMobile(event.type)) {
                                    obj = kintone.mobile.app.record.get();
                                } else {
                                    obj = kintone.app.record.get();
                                }
                                obj.record[`authorizer_${i + 1}`].value = authArr[i][0].code;
                                obj.record[`authorized_user_${i + 1}`].value = [authArr[i][0]];
                                if (isMobile(event.type)) {
                                    kintone.mobile.app.record.set(obj);
                                } else {
                                    kintone.app.record.set(obj);
                                }

                                if (authArr[i][0].code === loginUserCode) {
                                    for (let j = 0; ; j++) {
                                        if (i + 1 - j < 1) {
                                            break;
                                        } else {
                                            let obj;
                                            if (isMobile(event.type)) {
                                                obj = kintone.mobile.app.record.get();
                                            } else {
                                                obj = kintone.app.record.get();
                                            }
                                            obj.record[`check_skip_authorizer_${i + 1 - j}`].value = ['Skip'];
                                            if (isMobile(event.type)) {
                                                kintone.mobile.app.record.set(obj);
                                            } else {
                                                kintone.app.record.set(obj);
                                            }
                                        }
                                    }
                                }
                            } else {
                                // 承認者が選択されていない場合
                                if (groupArr[i].length > 0) {
                                    const groupCode = { code: groupArr[i][0].code };
                                    // ワークフロー - 営業担当の場合、承認ユーザ設定しない
                                    if (groupArr[i][0].code === 'workflow-sales-group') {
                                        return;
                                    }

                                    // グループ内の所属ユーザーを取得
                                    // ---------- api ----------
                                    await kintone.api(usersInGroupPath, 'GET', groupCode, async (resp) => {
                                        // group内の社員ユーザ配列
                                        const usersInGroupArr = [];

                                        if (resp.users.length === 0) {
                                            // グループ内の所属ユーザーが存在しない場合
                                            Swal.fire({
                                                title: ET0002,
                                                html: EM0001,
                                                icon: 'error'
                                            });
                                            return;
                                        }
                                        resp.users.forEach(x => {
                                            usersInGroupArr.push(x);
                                        });

                                        // ログインユーザの優先する組織ID取得
                                        // ---------- api ----------
                                        await kintone.api(userApiPath, 'GET', userReqParam, async (resp) => {
                                            // 優先する組織ID
                                            const primaryOrgId = resp.users[0].primaryOrganization;
                                            if (!primaryOrgId) {
                                                // 優先する組織が設定されていない場合
                                                Swal.fire({
                                                    title: ET0003,
                                                    html: EM0001,
                                                    icon: 'error'
                                                });
                                                return;
                                            }
                                            const orgReqParam = { ids: primaryOrgId };
                                            // 優先する組織コード取得
                                            // ---------- api ----------
                                            await kintone.api(orgApiPath, 'GET', orgReqParam, async (resp) => {
                                                // 優先する組織コード
                                                const primaryOrgCode = resp.organizations[0].code;
                                                // 親組織の組織コード
                                                const parentOrgCode = resp.organizations[0].parentCode;
                                                const orgUserReqParam = { code: primaryOrgCode };
                                                // 組織内の社員リスト取得
                                                // ---------- api ----------
                                                await kintone.api(orgUserApiPath, 'GET', orgUserReqParam, async (resp) => {
                                                    // 組織内の社員code配列
                                                    const usersCodeInOrgArr = [];
                                                    resp.userTitles.forEach(x => {
                                                        usersCodeInOrgArr.push(x.user.code);
                                                    });

                                                    // グループ内の社員と、組織内の社員codeを比較
                                                    const groupAndOrgArr = findMatchingElements(usersInGroupArr, usersCodeInOrgArr);
                                                    console.log('groupAndOrgArr');
                                                    console.log(groupAndOrgArr);
                                                    if (groupAndOrgArr.length > 0) {
                                                        // 一致した場合

                                                        let obj;
                                                        if (isMobile(event.type)) {
                                                            obj = kintone.mobile.app.record.get();
                                                        } else {
                                                            obj = kintone.app.record.get();
                                                        }
                                                        obj.record[`authorizer_${i + 1}`].value = groupAndOrgArr[0].code;
                                                        obj.record[`authorized_user_${i + 1}`].value = [groupAndOrgArr[0]];
                                                        if (isMobile(event.type)) {
                                                            kintone.mobile.app.record.set(obj);
                                                        } else {
                                                            kintone.app.record.set(obj);
                                                        }

                                                        if (groupAndOrgArr[0].code === loginUserCode) {
                                                            for (let j = 0; ; j++) {
                                                                if (i + 1 - j < 1) {
                                                                    break;
                                                                } else {
                                                                    let obj;
                                                                    if (isMobile(event.type)) {
                                                                        obj = kintone.mobile.app.record.get();
                                                                    } else {
                                                                        obj = kintone.app.record.get();
                                                                    }
                                                                    obj.record[`check_skip_authorizer_${i + 1 - j}`].value = ['Skip'];
                                                                    if (isMobile(event.type)) {
                                                                        kintone.mobile.app.record.set(obj);
                                                                    } else {
                                                                        kintone.app.record.set(obj);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        // 一致しなかった場合
                                                        // 親組織内の社員リスト取得
                                                        const parentOrgUserReqParam = { code: parentOrgCode };
                                                        // ---------- api ----------
                                                        await kintone.api(orgUserApiPath, 'GET', parentOrgUserReqParam, async (resp) => {
                                                            // 親組織の社員code配列
                                                            const usersCodeInParentOrgArr = [];
                                                            resp.userTitles.forEach(async x => {
                                                                usersCodeInParentOrgArr.push(x.user.code);
                                                            });

                                                            // グループ内の社員codeと、親組織内の社員codeを比較
                                                            const groupAndParentOrgArr = findMatchingElements(usersInGroupArr, usersCodeInParentOrgArr);
                                                            if (groupAndParentOrgArr.length > 0) {
                                                                // 一致した場合
                                                                // todo

                                                                let obj;
                                                                if (isMobile(event.type)) {
                                                                    obj = kintone.mobile.app.record.get();
                                                                } else {
                                                                    obj = kintone.app.record.get();
                                                                }
                                                                obj.record[`authorizer_${i + 1}`].value = groupAndParentOrgArr[0].code;
                                                                obj.record[`authorized_user_${i + 1}`].value = [groupAndParentOrgArr[0]];
                                                                if (isMobile(event.type)) {
                                                                    kintone.mobile.app.record.set(obj);
                                                                } else {
                                                                    kintone.app.record.set(obj);
                                                                }

                                                                if (groupAndParentOrgArr[0].code === loginUserCode) {
                                                                    for (let j = 0; ; j++) {
                                                                        if (i + 1 - j < 1) {
                                                                            break;
                                                                        } else {
                                                                            let obj;
                                                                            if (isMobile(event.type)) {
                                                                                obj = kintone.mobile.app.record.get();
                                                                            } else {
                                                                                obj = kintone.app.record.get();
                                                                            }
                                                                            obj.record[`check_skip_authorizer_${i + 1 - j}`].value = ['Skip'];
                                                                            if (isMobile(event.type)) {
                                                                                kintone.mobile.app.record.set(obj);
                                                                            } else {
                                                                                kintone.app.record.set(obj);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            } else {
                                                                // 親親組織を取得
                                                                const grandParentOrgUserReqParam = { codes: parentOrgCode };
                                                                // ---------- api ----------
                                                                await kintone.api(orgApiPath, 'GET', grandParentOrgUserReqParam, async (resp) => {
                                                                    // 親親組織コードを取得
                                                                    const grandParentOrgCode = resp.organizations[0].parentCode;
                                                                    // 親親組織内の社員リスト取得
                                                                    const grandParentUsersReqParam = { code: grandParentOrgCode };
                                                                    // ---------- api ----------
                                                                    await kintone.api(orgUserApiPath, 'GET', grandParentUsersReqParam, async (resp) => {
                                                                        // 親親組織の社員配列
                                                                        const usersIdInGrandParentOrgArr = [];
                                                                        resp.userTitles.forEach(async x => {
                                                                            usersIdInGrandParentOrgArr.push(x.user.code);
                                                                        });
                                                                        // グループ内の社員IDと、親親組織内の社員IDを比較
                                                                        const groupAndGrandParentOrgArr = findMatchingElements(usersInGroupArr, usersIdInGrandParentOrgArr);
                                                                        // todo
                                                                        if (groupAndGrandParentOrgArr.length === 0) {
                                                                            // 一致する承認者が見つからない場合
                                                                            // スキップにチェック
                                                                            let obj;
                                                                            if (isMobile(event.type)) {
                                                                                obj = kintone.mobile.app.record.get();
                                                                            } else {
                                                                                obj = kintone.app.record.get();
                                                                            }
                                                                            obj.record[`check_skip_authorizer_${i + 1}`].value = ['Skip'];
                                                                            if (isMobile(event.type)) {
                                                                                kintone.mobile.app.record.set(obj);
                                                                            } else {
                                                                                kintone.app.record.set(obj);
                                                                            }
                                                                        } else {
                                                                            // todo

                                                                            let obj;
                                                                            if (isMobile(event.type)) {
                                                                                obj = kintone.mobile.app.record.get();
                                                                            } else {
                                                                                obj = kintone.app.record.get();
                                                                            }
                                                                            obj.record[`authorizer_${i + 1}`].value = groupAndGrandParentOrgArr[0].code;
                                                                            obj.record[`authorized_user_${i + 1}`].value = [groupAndGrandParentOrgArr[0]];
                                                                            if (isMobile(event.type)) {
                                                                                kintone.mobile.app.record.set(obj);
                                                                            } else {
                                                                                kintone.app.record.set(obj);
                                                                            }

                                                                            if (groupAndGrandParentOrgArr[0].code === loginUserCode) {
                                                                                for (let j = 0; ; j++) {
                                                                                    if (i + 1 - j < 1) {
                                                                                        break;
                                                                                    } else {
                                                                                        let obj;
                                                                                        if (isMobile(event.type)) {
                                                                                            obj = kintone.mobile.app.record.get();
                                                                                        } else {
                                                                                            obj = kintone.app.record.get();
                                                                                        }
                                                                                        obj.record[`check_skip_authorizer_${i + 1 - j}`].value = ['Skip'];
                                                                                        if (isMobile(event.type)) {
                                                                                            kintone.mobile.app.record.set(obj);
                                                                                        } else {
                                                                                            kintone.app.record.set(obj);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            });
                                        });
                                    });
                                }
                            }
                        } else {
                            let obj;
                            if (isMobile(event.type)) {
                                obj = kintone.mobile.app.record.get();
                            } else {
                                obj = kintone.app.record.get();
                            }
                            obj.record[`check_skip_authorizer_${i + 1}`].value = ['Skip'];
                            if (isMobile(event.type)) {
                                kintone.mobile.app.record.set(obj);
                            } else {
                                kintone.app.record.set(obj);
                            }
                        }
                    });
                })
            });
        } catch (e) {
            console.log(e);
            Swal.fire({
                html: e.message + '<br><br>管理者に問い合わせをお願いします',
                icon: 'error'
            });
        }
    })
})();

/*
* ---------------------------------------
* コメント入力ボタン
* @device: PC
* ---------------------------------------
*/
(() => {
    'use strict';
    const spaceId = 'input_comment_button';
    const events = [
        'app.record.detail.show',
        'mobile.app.record.detail.show'
    ];
    kintone.events.on(events, (event) => {
        const record = event.record;
        const recordId = record.$id.value;
        let appId;
        if (isMobile(event.type)) {
            appId = kintone.mobile.app.getId();
        } else {
            appId = kintone.app.getId();
        }
        const inputCommentButton = document.createElement('button');
        let space;
        if (isMobile(event.type)) {
            space = kintone.mobile.app.record.getSpaceElement(spaceId);
        } else {
            space = kintone.app.record.getSpaceElement(spaceId);
        }
        inputCommentButton.id = 'input_comment_button';
        inputCommentButton.innerText = '　　承認者コメントを入力';
        inputCommentButton.onclick = function () {
            let baseUrl;
            let url;
            if (isMobile(event.type)) {
                baseUrl = 'https://wise-kansai.cybozu.com/k/m/';
                url = baseUrl + appId + `/show?record=${recordId}#mode=edit`;
            } else {
                baseUrl = 'https://wise-kansai.cybozu.com/k/';
                url = baseUrl + appId + `/show#record=${recordId}&mode=edit`;
            }
            console.log(url);
            window.location.href = url;

            // 遷移後スクロール
            setTimeout(function () {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'auto'
                });
            }, 500);
        }
        // ボタン設置
        space.appendChild(inputCommentButton);
    })
})();

// 二つの配列内で完全一致する要素を取得する
function findMatchingElements(arr1, arr2) {
    let codeArr = arr1.map(e => e.code);
    let matchingArr = [];
    codeArr.forEach((e, i) => {
        if (arr2.includes(e)) {
            matchingArr.push(arr1[i]);
        }
    });
    // let matchingArr = arr1.filter(e => arr2.includes(e));
    return matchingArr;
}

// 文字列内から数字を抽出(ない場合false)
function extractNum(str) {
    const regex = /\d+/g;
    const number = str.match(regex);
    if (number === null) {
        return false;
    } else {
        return number[0];
    }
}

// Date()をkintone日時フォーマットに変換
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
}

/* customineにて生成したボタンのスタイルを変更 */
(function () {
    // ボタンが生成される親要素を監視（ここではbody全体を監視）
    const targetNode = document.body;

    // 監視オプション（DOMの子要素追加を監視）
    const config = { childList: true, subtree: true };

    // ボタンのテキストに基づいて適用するCSSを設定
    const buttonStyles = {
        "「自分の承認待ち」 一覧を表示": {
            css: `
                font-size: 14px;
                padding: 0.8rem;
                border: 2px solid #c9171e;
                position: relative;
                left: 20px;
                color: #c9171e;
                background-color: #ffffff;
                background: url("https://img.icons8.com/ios-glyphs/30/c9171e/high-priority.png") no-repeat;
                background-position: 5px 5px;
                height: 48px;
                display: inline-flex;
                justify-content: flex-end;
                align-items: center;
                line-height: 1.5;
                white-space: pre-line;
                font-weight: bold;
                width: 175px;
            `,
            hoverCss: `
                color: #ffffff !important;
                background: url("https://img.icons8.com/ios-glyphs/30/ffffff/high-priority.png") no-repeat !important;
                background-position: 5px 5px !important;
                background-color: #c9171e !important;
                border: 2px solid #c9171e !important;
            `
        },
        "「自分の作成分」 一覧を表示": {
            css: `
                font-size: 14px;
                padding: 0.8rem;
                border: 2px solid #1738c9;
                position: relative;
                left: 20px;
                color: #1738c9;
                background-color: #ffffff;
                background: url("https://img.icons8.com/ios-glyphs/30/1738c9/signing-a-document.png") no-repeat;
                background-position: 5px 5px;
                height: 48px;
                display: inline-flex;
                justify-content: flex-end;
                align-items: center;
                line-height: 1.5;
                white-space: pre-line;
                font-weight: bold;
                width: 160px;
            `,
            hoverCss: `
                color: #ffffff !important;
                background: url("https://img.icons8.com/ios-glyphs/30/ffffff/signing-a-document.png") no-repeat !important;
                background-position: 5px 5px !important;
                background-color: #1738c9 !important;
                border: 2px solid #1738c9 !important;
            `
        },
        "「承認済みの全件」 一覧を表示": {
            css: `
                font-size: 14px;
                padding: 0.8rem;
                border: 2px solid #0d6909;
                position: relative;
                left: 20px;
                color: #0d6909;
                background-color: #ffffff;
                background: url("https://img.icons8.com/ios-glyphs/30/0d6909/approval.png") no-repeat;
                background-position: 5px 5px;
                height: 48px;
                display: inline-flex;
                justify-content: flex-end;
                align-items: center;
                line-height: 1.5;
                white-space: pre-line;
                font-weight: bold;
                width: 175px;
            `,
            hoverCss: `
                color: #ffffff !important;
                background: url("https://img.icons8.com/ios-glyphs/30/ffffff/approval.png") no-repeat !important;
                background-position: 5px 5px !important;
                background-color: #0d6909 !important;
                border: 2px solid #0d6909 !important;
            `
        },
        "取下げ": {
            css: `
                font-size: 14px;
                padding-right: 0.7rem;
                border: 2px #c9171e;
                position: relative;
                left: 20px;
                color: #ffffff;
                background: url("https://img.icons8.com/windows/24/ffffff/hand.png") no-repeat;
                background-color: #c9171e;
                background-position: 7px 7px;
                height: 39px;
                display: inline-flex;
                justify-content: center;
                align-items: center;
            `,
            hoverCss: `
                color: #c9171e !important;
                background-color: #ffffff !important;
                border: 2px solid #c9171e !important;
                background: url("https://img.icons8.com/windows/24/c9171e/hand.png") no-repeat !important;
                background-position: 5px 5px !important;
            `
        },
        "代理承認": {
            css: `
                position: relative;
                left: 40px;
                color: #ffffff;
                border: 2px #000080;
                background: url(https://img.icons8.com/ios-glyphs/24/ffffff/gender-neutral-user.png) no-repeat;
                background-position: 7px 5px;
                background-color: #000080;
                height: 38px;
                width: 160px;
                bottom: -1.4px;
            `,
            hoverCss: `
                color: #000080 !important;
                border: 2px solid #000080 !important;
                background: url(https://img.icons8.com/ios-glyphs/24/000080/gender-neutral-user.png) no-repeat !important;
                background-position: 7px 5px !important;
                background-color: #ffffff !important;
            `
        },
        "レコード流用": {
            css: `
                font-size: 14px;
                padding-right: 0.7rem;
                border: 2px #228b22;
                position: relative;
                left: 20px;
                color: #ffffff;
                background: url("https://img.icons8.com/glyph-neue/24/ffffff/share-3.png") no-repeat;
                background-color: #228b22;
                background-position: 7px 7px;
                height: 39px;
                display: inline-flex;
                justify-content: center;
                align-items: center;
            `,
            hoverCss: `
                color: #228b22 !important;
                background-color: #ffffff !important;
                border: 2px solid #228b22 !important;
                background: url("https://img.icons8.com/glyph-neue/24/228b22/share-3.png") no-repeat !important;
                background-position: 5px 5px !important;
            `
        },
        "取消申請": {
            css: `
                font-size: 14px;
                padding-right: 0.7rem;
                border: 2px #000;
                position: relative;
                left: 20px;
                color: #ffffff;
                background: url(https://img.icons8.com/ios-glyphs/24/ffffff/cancel.png) no-repeat;
                background-color: #000;
                background-position: 7px 7px;
                height: 39px;
                display: inline-flex;
                justify-content: center;
                align-items: center;
            `,
            hoverCss: `
                color: #000 !important;
                background-color: #ffffff !important;
                border: 2px solid #000 !important;
                background: url(https://img.icons8.com/ios-glyphs/24/000/cancel.png) no-repeat !important;
                background-position: 5px 5px !important;
            `
        }
    };

    // MutationObserverのコールバック関数
    const observerCallback = (mutationsList, observer) => {
        mutationsList.forEach(mutation => {
            mutation.addedNodes.forEach(addedNode => {
                // 追加されたノードがボタン要素か確認
                if (addedNode.nodeName === 'BUTTON') {
                    // ボタンのテキストがターゲットのボタンテキストと一致するか確認
                    const buttonText = addedNode.innerText.trim();

                    // 一致するボタンがあれば、そのCSSを適用
                    if (buttonStyles[buttonText]) {
                        // インラインスタイルを適用
                        addedNode.setAttribute("style", buttonStyles[buttonText].css);

                        // ボタンにhoverのスタイルを適用
                        const hoverStyle = buttonStyles[buttonText].hoverCss;
                        const buttonId = addedNode.id;
                        if (!buttonId) {
                            buttonId = 'button-' + Date.now(); // 重複しないIDを生成
                            addedNode.id = buttonId;
                        }

                        // hover時のスタイルをスタイルタグとして追加
                        const styleTag = document.createElement('style');
                        styleTag.innerHTML = `
                            #${buttonId}:hover {
                                ${hoverStyle}
                            }
                        `;
                        document.head.appendChild(styleTag);
                    }
                }
            });
        });
    };

    // MutationObserverインスタンスを作成
    const observer = new MutationObserver(observerCallback);

    // 監視を開始
    observer.observe(targetNode, config);

    // 必要に応じて監視を停止する場合
    // observer.disconnect();
})();