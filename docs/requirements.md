# Product

client for csvs, data converter

competes: 

interacts: with filesystem

constitutes: a cli shell application, spawned system processes

includes: cli scaffold, stream pipe, import streams for csvs, jsonlines, vk, tg; export streams for csvs, biorg, tex, jsonlines

patterns: 

resembles: jq

stakeholders: fetsorn

- replace `--stats` flag with `-t stats` output type

# Technical

## 过 钙 回
- user must import csvs dataset from filesystem
## 杆 雕 破
- user can import a VKontakte backup
## 壤 辨 若
- user can import a Telegram backup
## 训 残 书
- user must query JSONLines from stdin
## 渠 诗 牲
- user must query JSONLines from file
## 泉 避 妇
- user must query after import
## 景 浩 家
- user must query before export
## 弓 乃 块
- user must export entries to csvs dataset on the filesystem
## 览 售 盾
- user must export entries to JSONLines on stdout
## 竞 闪 彻
- user must export entries to JSONLines on filesystem
## 朱 约 夫
- user must export entries to biorg on filesystem
## 鼓 坑 岸
- user must export entries to biorg on stdout
## 迎 鸡 埋
- user can export entries to tex on stdout
## 圈 及 身
- user can export entries to tex on filesystem
## 锋 倡 薄
- user must import xattr entries from a listing of filepaths on stdin
## 扭 肌 库
- user must import xattr entries from a listing of filepaths on filesystem
## 托 李 板
- user should see number of entries in a dataset after import
## 滨 尖 抵
- user should see filesystem size of a dataset after import
## 期 衣 运
- user should see schema of a dataset after import
## 局 吹 众
- user can add a new entry from an interactive prompt
## 姑 多 描
- user can edit entry from an interactive prompt
## 值 贴 姜
- user can see a progress bar during entry search
## 依 农 徙
- user must import biorg
