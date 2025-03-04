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
* 一覧、追加、編集、詳細画面 > 設定ボタン非表示
* @device: PC
* ---------------------------------------
*/
(() => {
  'use strict';
  const events = [
    'app.record.index.show',
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.detail.show',
    'mobile.app.record.index.show',
    'mobile.app.record.create.show',
    'mobile.app.record.edit.show',
    'mobile.app.record.detail.show',

  ];
  kintone.events.on(events, (event) => {
    const loginUser = kintone.getLoginUser();
    const developerUsersArr = ['r-tanaka@wise-kansai.com', 'y-yasui@wise-kansai.com'];
    const settingButton = document.querySelector('.gaia-argoui-app-menu-settingssplitbutton');
    if (!developerUsersArr.includes(loginUser.code)) {
      if (settingButton) {
        settingButton.style.display = 'none';
      }
    }
    return event;
  })
})();

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
    const appName = record.app_name.value;
    const recordId = record.レコード番号.value;
    const action = event.action.value;
    const nextStatus = event.nextStatus.value;
    const status = event.status.value;
    const comment = record.request_approval_comment.value;
    const worker = record.作業者.value[0].code;
    const title = record.title.value;
    const applicantDate = record.applicant_date.value;
    const applicantUser = record.applicant_user.value[0].code;
    const applicantEmployeeId = record.applicant_employee_id.value;
    const applicantDepartment = record.applicant_department.value[0].code;
    const authorizer1 = record.authorizer_1.value;
    const authorizer2 = record.authorizer_2.value;
    const authorizer3 = record.authorizer_3.value;
    const authorizer4 = record.authorizer_4.value;
    const authorizer5 = record.authorizer_5.value;
    const authorizer6 = record.authorizer_6.value;
    const applicationNotifiedUsers = record.application_notified_users.value;
    const approvalNotifiedUsers = record.approval_notified_users.value;
    const applicationNotifiedUsersText = record.application_notified_users_text.value;
    const approvalNotifiedUsersText = record.approval_notified_users_text.value;
    const KESSAI = '決裁';
    const TORISAGE = '取下げ';
    const SASHIMODOSI = '差し戻し';
    const SHINSEI = '申請';
    const SAISHINSEI = '再申請';
    const SYONIN = '承認';
    const SASHIMODOSI_SHINSEISYA = '差し戻し(申請者)';
    const SASHIMODOSI_1 = '差し戻し(1次承認者)';
    const SASHIMODOSI_2 = '差し戻し(2次承認者)';
    const SASHIMODOSI_3 = '差し戻し(3次承認者)';
    const SASHIMODOSI_4 = '差し戻し(4次承認者)';
    const SASHIMODOSI_5 = '差し戻し(5次承認者)';
    const MISHINSEI = '未申請';
    const SYOUNINCHU_1 = '1次 承認中';
    const SYOUNINCHU_2 = '2次 承認中';
    const SYOUNINCHU_3 = '3次 承認中';
    const SYOUNINCHU_4 = '4次 承認中';
    const SYOUNINCHU_5 = '5次 承認中';
    const SYOUNINCHU_6 = '6次 承認中';
    // ↓アプリごとに変更必要
    let appId;
    let url;
    if (isMobile(event.type)) {
      appId = kintone.mobile.app.getId();
      url = `https://wise-kansai.cybozu.com/k/m/${appId}/show#record=${recordId}`;
    } else {
      appId = kintone.app.getId();
      url = `https://wise-kansai.cybozu.com/k/${appId}/show#record=${recordId}`;
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

    // 元レコードの値を更新
    // - 認者コメントを、最新の承認者コメント欄に移動
    // - 最新の承認者欄へ値をセット
    record.recent_authorizer_comment.value = comment;
    record.request_approval_comment.value = '';
    record.recent_authorizer.value = [{ code: worker }];

    // - 現在の通知先の設定
    let currentMailAddress = '';
    // -- action:差し戻しの場合
    if (action === SASHIMODOSI) {
      if (nextStatus === SASHIMODOSI_SHINSEISYA) {
        record.current_mail_address.value = applicantUser;
        currentMailAddress = applicantUser;
      }
      if (nextStatus === SASHIMODOSI_1) {
        record.current_mail_address.value = authorizer1;
        currentMailAddress = authorizer1;
      }
      if (nextStatus === SASHIMODOSI_2) {
        record.current_mail_address.value = authorizer2;
        currentMailAddress = authorizer2;
      }
      if (nextStatus === SASHIMODOSI_3) {
        record.current_mail_address.value = authorizer3;
        currentMailAddress = authorizer3;
      }
      if (nextStatus === SASHIMODOSI_4) {
        record.current_mail_address.value = authorizer4;
        currentMailAddress = authorizer4;
      }
      if (nextStatus === SASHIMODOSI_5) {
        record.current_mail_address.value = authorizer5;
        currentMailAddress = authorizer5;
      }
    }
    // -- action:取下げの場合

    // -- action:再申請の場合
    if (action === SAISHINSEI) {
      if (nextStatus === SYOUNINCHU_1) {
        record.current_mail_address.value = authorizer1;
        currentMailAddress = authorizer1;
      }
      if (nextStatus === SYOUNINCHU_2) {
        record.current_mail_address.value = authorizer2;
        currentMailAddress = authorizer2;
      }
      if (nextStatus === SYOUNINCHU_3) {
        record.current_mail_address.value = authorizer3;
        currentMailAddress = authorizer3;
      }
      if (nextStatus === SYOUNINCHU_4) {
        record.current_mail_address.value = authorizer4;
        currentMailAddress = authorizer4;
      }
      if (nextStatus === SYOUNINCHU_5) {
        record.current_mail_address.value = authorizer5;
        currentMailAddress = authorizer5;
      }
      if (nextStatus === SYOUNINCHU_6) {
        record.current_mail_address.value = authorizer6;
        currentMailAddress = authorizer6;
      }
    }
    // -- action:申請の場合
    if (action === SHINSEI) {
      if (nextStatus === SYOUNINCHU_1) {
        record.current_mail_address.value = authorizer1;
        currentMailAddress = authorizer1;
      }
      if (nextStatus === SYOUNINCHU_2) {
        record.current_mail_address.value = authorizer2;
        currentMailAddress = authorizer2;
      }
      if (nextStatus === SYOUNINCHU_3) {
        record.current_mail_address.value = authorizer3;
        currentMailAddress = authorizer3;
      }
      if (nextStatus === SYOUNINCHU_4) {
        record.current_mail_address.value = authorizer4;
        currentMailAddress = authorizer4;
      }
      if (nextStatus === SYOUNINCHU_5) {
        record.current_mail_address.value = authorizer5;
        currentMailAddress = authorizer5;
      }
      if (nextStatus === SYOUNINCHU_6) {
        record.current_mail_address.value = authorizer6;
        currentMailAddress = authorizer6;
      }
    }
    // --action:承認の場合
    if (action === SYONIN) {
      if (nextStatus === SYOUNINCHU_2) {
        record.current_mail_address.value = authorizer2;
        currentMailAddress = authorizer2;
      }
      if (nextStatus === SYOUNINCHU_3) {
        record.current_mail_address.value = authorizer3;
        currentMailAddress = authorizer3;
      }
      if (nextStatus === SYOUNINCHU_4) {
        record.current_mail_address.value = authorizer4;
        currentMailAddress = authorizer4;
      }
      if (nextStatus === SYOUNINCHU_5) {
        record.current_mail_address.value = authorizer5;
        currentMailAddress = authorizer5;
      }
      if (nextStatus === SYOUNINCHU_6) {
        record.current_mail_address.value = authorizer6;
        currentMailAddress = authorizer6;
      }
    }
    // --action:決裁の場合
    if (action === KESSAI) {
      record.current_mail_address.value = applicantUser;
      currentMailAddress = applicantUser;
    }

    // 処理者の社員番号と部署を取得
    const workerEmployeeId = await kintone.api(kintone.api.url('/v1/users.json', true), 'GET', { code: worker }).then((resp) => {
      return resp.users[0].employeeNumber;
    });
    const workerDepartment = await kintone.api(kintone.api.url('/v1/user/organizations.json', true), 'GET', { code: worker }).then((resp) => {
      return resp.organizationTitles[0].organization.code;
    });

    // 承認履歴アプリへのレコード追加
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
        value: [{ code: worker }]
      },
      'approver_employee_id': {
        value: workerEmployeeId
      },
      'approver_dist': {
        value: [{ code: workerDepartment }]
      },
      'application_notified_users': {
        value: applicationNotifiedUsers
      },
      'approval_notified_users': {
        value: approvalNotifiedUsers
      },
      'application_notified_users_text': {
        value: applicationNotifiedUsersText
      },
      'approval_notified_users_text': {
        value: approvalNotifiedUsersText
      },
      'current_mail_address': {
        value: currentMailAddress
      },
      'url': {
        value: url
      },
      'app_name': {
        value: appName
      },
      'applicant_user': {
        value: [{ code: applicantUser }]
      },
      'applicant_employee_id': {
        value: applicantEmployeeId
      },
      'applicant_dist': {
        value: [{ code: applicantDepartment }]
      },
      'applicant_date': {
        value: formatDate(new Date(applicantDate))
      },
      'title': {
        value: title
      }
    };

    const params = {
      app: 324, // todo
      record: data,
    };

    try {
      // 承認履歴
      await kintone.api(kintone.api.url('/k/v1/record.json', true), 'POST', params);
    } catch (e) {
      console.log(e);
    }
    return event;
  })
})();

/*
* ---------------------------------------
* 保存時 承認ルートから承認者を決定
* @device: PC
* ---------------------------------------
*/
(() => {
  'use strict';
  const events = [
    'app.record.create.submit',
    'app.record.edit.submit',
    'mobile.app.record.create.submit',
    'mobile.app.record.edit.submit'
  ];

  // 部門長グループ
  const leaderOfDept = 'leader-of-dept';
  // 所属長グループ
  const headOfDept = 'head-of-dept';

  // ステータス
  const MISINSEI = '未申請';
  const SASIMODOSI_SINSEISYA = '差し戻し(申請者)';

  // エラータイトル
  const ET0001 = '承認経路が見つかりませんでした';
  const ET0002 = '役職内にメンバーが存在しませんでした';
  const ET0003 = '作成者の優先する組織が設定されていませんでした';
  // エラーメッセージ
  const EM0001 = '管理者に問い合わせをお願いします';

  kintone.events.on(events, async (event) => {
    try {
      const record = event.record;

      // login user 取得
      const loginUserCode = kintone.getLoginUser().code;
      // appid 取得
      let appId;
      if (isMobile(event.type)) {
        appId = kintone.mobile.app.getId();
      } else {
        appId = kintone.app.getId();
      }

      // API paths
      const getPath = '/k/v1/records.json';
      const userApiPath = '/v1/users.json';
      const orgApiPath = '/v1/organizations.json';
      const orgUserApiPath = '/v1/organization/users.json';
      const usersInGroupPath = '/v1/group/users.json';
      const userGroupsPath = '/v1/user/groups.json';

      // 未申請の場合のみ処理を実行 && 承認者・スキップのチェックを初期化
      // 差戻しの場合は承認者は前回と同じにする
      if (event.type.includes('edit.submit')) {
        const status = record.ステータス.value;
        if (!(status === MISINSEI)) {
          return event;
        } else {
          for (let i = 1; i <= 6; i++) {
            record[`authorizer_${i}`].value = [];
            record[`authorized_user_${i}`].value = [];
            record[`check_skip_authorizer_${i}`].value = [];
          }
        }
      }

      // 「取消申請」アプリの場合
      if (appId === 351) {
        const cancelApplicationId = record.cancel_application_id.value;
        const cancelAppId = cancelApplicationId.slice(1, 4);
        const body = {
          app: cancelAppId,
          query: `application_id = "${cancelApplicationId}"`,
          fields: [
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
            'authorized_user_1',
            'authorized_user_2',
            'authorized_user_3',
            'authorized_user_4',
            'authorized_user_5',
            'authorized_user_6',
          ]
        };
        const resp = await kintone.api(getPath, 'GET', body);
        if (resp.records.length === 0) {
          console.log('取消元の申請が見つかりませんでした' + ' 取消対象の申請ID：' + cancelApplicationId);
          return false;
        } else {
          for (let i = 1; i<= 6; i++) {
            record[`authorizer_${i}`].value = resp.records[0][`authorizer_${i}`].value;
            record[`check_skip_authorizer_${i}`].value = resp.records[0][`check_skip_authorizer_${i}`].value;
            record[`authorized_user_${i}`].value = resp.records[0][`authorized_user_${i}`].value;
          }
        }
        return event;
      }

      // ワークフローの取得条件を設定
      let workflowQuery = `target_app_id = ${appId} and root_department in (PRIMARY_ORGANIZATION())`;

      // 請求・給与修正届の場合
      if (appId === 383) {
        const workflowType = record.workflow_type.value;
        workflowQuery += ` and workflow_type in ("${workflowType}")`;
      }

      // 取消申請画面へ遷移時 > 遷移前の承認経路にて承認ルート取得
      const beforeWorkflowKey = sessionStorage.getItem('beforeWorkflowKey');
      if (beforeWorkflowKey) {
        workflowQuery = `workflow_lookup_key = "${beforeWorkflowKey}"`;
        sessionStorage.removeItem('beforeWorkflowKey');
      }

      // 承認経路マスタから承認経路を取得
      const workflowBody = {
        app: '321',
        query: workflowQuery,
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

      const workflowResponse = await kintone.api(getPath, 'GET', workflowBody);
      if (workflowResponse.records.length === 0) {
        // 承認経路マスタから取得したデータが0件の場合
        await Swal.fire({
          title: ET0001,
          html: EM0001,
          icon: 'error'
        });
        return false;
      }

      const workflow = workflowResponse.records[0];

      // ログインユーザーの情報を取得
      // 優先する組織が設定されているか確認
      const userResponse = await kintone.api(userApiPath, 'GET', { codes: loginUserCode });
      const primaryOrgId = userResponse.users[0].primaryOrganization;

      if (!primaryOrgId) {
        // 優先する組織が設定されていない場合
        await Swal.fire({
          title: ET0003,
          html: EM0001,
          icon: 'error'
        });
        return event;
      }

      // 組織情報の取得
      // 優先する組織のコードと親組織のコードを取得
      const orgResponse = await kintone.api(orgApiPath, 'GET', { ids: primaryOrgId });
      const primaryOrgCode = orgResponse.organizations[0].code;
      const parentOrgCode = orgResponse.organizations[0].parentCode;

      // 親親組織を取得
      const grandOrgResponse = await kintone.api(orgApiPath, 'GET', { codes: parentOrgCode });
      // const grandParentOrgCode = grandOrgResponse.organizations[0].parentCode;

      // 承認者リスト
      let assignedApprovers = [];

      // 承認者の設定を処理
      // 承認者1~6まで順番に設定
      for (let i = 1; i <= 6; i++) {
        const checkSkip = workflow[`check_skip_authorizer_${i}`].value;
        const authorizer = workflow[`authorizer_${i}`].value;
        const group = workflow[`group_${i}`].value;

        // Skipにチェックがある場合
        if (checkSkip.length > 0) {
          record[`check_skip_authorizer_${i}`].value = ['Skip'];
          continue;
        }

        // 承認者が直接指定されている場合
        if (authorizer.length > 0) {
          // 承認者リストに同じ人物がいる場合 > skip
          if (assignedApprovers.includes(authorizer[0].code)) {
            record[`check_skip_authorizer_${i}`].value = ['Skip'];
            record[`authorizer_${i}`].value = '';
            record[`authorized_user_${i}`].value = [];
          } else {
            record[`authorizer_${i}`].value = authorizer[0].code;
            record[`authorized_user_${i}`].value = [authorizer[0]];
            // 承認者リストに追加
            assignedApprovers.push(authorizer[0].code);
          }

          if (authorizer[0].code === loginUserCode) {
            // 承認者がログインユーザーの場合
            for (let j = i; j >= 1; j--) {
              record[`check_skip_authorizer_${j}`].value = ['Skip'];
            }
          }
          continue;
        }

        // グループから承認者を決定する場合
        if (group.length > 0 && group[0].code !== 'workflow-sales-group') {
          const groupUsers = await kintone.api(usersInGroupPath, 'GET', { code: group[0].code });

          if (groupUsers.users.length === 0) {
            // グループ内の所属ユーザーが存在しない場合
            await Swal.fire({
              title: ET0002,
              html: EM0001,
              icon: 'error'
            });
            return event;
          }

          // ----- 修正対象箇所 start -----
          let orgCode;
          let orgUsers;
          let orgUserCodes;
          let matchingUsers;
          for (let count = 0; ; count++) {
            if (count === 0) {
              orgCode = primaryOrgCode;
            } else if (count === 1) {
              orgCode = parentOrgCode;
            } else {
              const grandParentOrg = await kintone.api(orgApiPath, 'GET', { codes: [orgCode] });
              orgCode = grandParentOrg.organizations[0].parentCode;
            }
            if (orgCode === 'wisekansai') {
              // 組織コード：wisekansaiの場合
              break;
            }
            orgUsers = await kintone.api(orgUserApiPath, 'GET', { code: orgCode });
            orgUserCodes = orgUsers.userTitles.map(user => user.user.code);
            console.log('orgUserCodes', orgUserCodes);
            matchingUsers = groupUsers.users.filter(user => orgUserCodes.includes(user.code));
            if (matchingUsers.length > 0) {
              // 承認者リストに同じ人物がいる場合
              if (assignedApprovers.includes(matchingUsers[0].code)) {
                record[`check_skip_authorizer_${i}`].value = ['Skip'];
                record[`authorizer_${i}`].value = '';
                record[`authorized_user_${i}`].value = [];
              } else {
                record[`authorizer_${i}`].value = matchingUsers[0].code;
                record[`authorized_user_${i}`].value = [matchingUsers[0]];
                // 承認者リストに追加
                assignedApprovers.push(matchingUsers[0].code);
              }

              if (matchingUsers[0].code === loginUserCode) {
                for (let j = i; j >= 1; j--) {
                  record[`check_skip_authorizer_${j}`].value = ['Skip'];
                }
              }
              break;
            }
          }
        }
      }
      for (let i = 1; i <= assignedApprovers.length; i++) {
        if (record[`authorizer_${i}`].value === assignedApprovers[assignedApprovers.length - 1]) {
          record[`check_skip_authorizer_${i}`].value = [];
        }
      }
      return event;
    } catch (error) {
      console.error('Error in workflow approval route:', error);
      await Swal.fire({
        html: `${error.message}<br><br>管理者に問い合わせをお願いします`,
        icon: 'error'
      });
      return event;
    }
  });
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
    "「自分の対応待ち」 一覧を表示": {
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

/*
* ---------------------------------------
* ui component 詳細画面
* @device: PC
* ---------------------------------------
*/
// Checkbox
(() => {
  'use strict';
  kintone.events.on('app.record.detail.show', (event) => {
    kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {
      app: kintone.app.getId()
    }).then((response) => {
      Object.keys(response.properties).filter((fieldCode) => {
        return response.properties[fieldCode].type === 'CHECK_BOX';
      }).map((fieldCode) => {
        return {
          code: fieldCode,
          options: Object.keys(response.properties[fieldCode].options).map((option) => {
            return response.properties[fieldCode].options[option];
          }).sort((a, b) => {
            if (a.index < b.index) return -1;
            return 1;
          })
        };
      }).forEach(async (property) => {
        const originElement = kintone.app.record.getFieldElement(property.code);
        const checkboxElement = new Kuc.Checkbox({
          // name: property.code,
          items: property.options.map((option) => {
            return { value: option.label };
          }),
          value: event.record[property.code].value,
          className: 'kuc-checkbox-style',
          disabled: true
        });

        await originElement.parentNode.insertBefore(checkboxElement, originElement);
        await originElement.parentNode.removeChild(originElement);
      });
    });
  });
})();