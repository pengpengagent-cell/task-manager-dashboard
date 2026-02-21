# タスク管理ウェブサイト設計書

## 概要
メインエージェント（PengPeng）とサブエージェント間のタスク管理・調整を行うウェブダッシュボード。

## 目的
- メインエージェントがタスクを貯める「ビン」を提供
- 優先順位付けとサブエージェントへの振り分けを可視化
- リアルタイムで思考過程と進捗を表示

## アーキテクチャ

### 技術スタック
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL + Realtime)
- **UI**: shadcn/ui + dnd-kit
- **認証**: Supabase Auth

### データモデル
```sql
-- tasksテーブル
id: uuid (primary key)
title: text
description: text
status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
priority: integer (1-5, 1=最高)
assignee: text (agent id)
created_at: timestamp
updated_at: timestamp
completed_at: timestamp
metadata: jsonb

-- agentsテーブル
id: text (primary key: 'main' | 'dev' | 'learn' | 'monitor' | 'creator')
name: text
status: 'idle' | 'busy' | 'error'
last_heartbeat: timestamp
current_task_id: uuid (foreign key)
capabilities: text[]
```

### コンポーネント構成
1. **TaskBin**: タスクビン（ドラッグ&ドロップ対応）
2. **TaskCard**: タスクカード（詳細表示）
3. **AgentStatus**: エージェント状態表示
4. **AddTaskModal**: 新規タスク作成モーダル

## 機能一覧

### コア機能
- [x] タスク作成/編集/削除
- [x] ドラッグ&ドロップによる優先順位変更
- [x] サブエージェントへのタスク割り当て
- [x] リアルタイム進捗表示
- [x] 思考過程ログ表示
- [x] エラーログ表示

### 自動化機能
- [x] 優先度に基づく自動割り当て
- [x] エージェント状態監視
- [x] タスクビン容量管理

### 監視機能
- [x] 統計ダッシュボード
- [x] エージェントハートビート表示
- [x] タスク完了率表示

## OpenClaw連携

### 統合ポイント
1. **Cronジョブ連携**: OpenClaw Cron → Supabaseタスク自動作成
2. **サブエージェント連携**: サブエージェント起動 → Supabaseステータス更新
3. **Webhook連携**: OpenClaw → タスク更新通知

### 実装計画
1. **Phase 1**: 基本UI + インメモリストア（完了）
2. **Phase 2**: Supabase統合 + リアルタイム更新
3. **Phase 3**: OpenClaw連携 + 自動化
4. **Phase 4**: 高度な分析 + レポート

## デプロイ

### 環境変数
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercelデプロイ手順
1. GitHubリポジトリ作成
2. VercelでNew Project → Import from GitHub
3. 環境変数を設定
4. デプロイ自動化

## 今後の拡張

### 短期目標
- [ ] Supabase Realtime統合
- [ ] ユーザー認証
- [ ] タスクテンプレート
- [ ] バッチ処理

### 長期目標
- [ ] AIによる優先度予測
- [ ] リソース最適化
- [ ] マルチテナント対応
- [ ] モバイルアプリ

## テスト計画

### 単体テスト
- タスク作成/更新/削除
- エージェント状態管理
- 優先度計算ロジック

### 統合テスト
- OpenClaw連携
- リアルタイム更新
- エラーハンドリング

### E2Eテスト
- ユーザーフロー
- パフォーマンス
- セキュリティ