import React, { useState } from "react";
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { gerarPixQRCode } from "@/utils/pixQrCode";

type Props = {
  visible: boolean;
  onClose: () => void;
  pixChave?: string | null;
  pixTipo?: string | null;
  pixImagem?: string | null;
  nomeMotorista?: string;
  valor?: number;
  apiBase?: string;
};

const PIX_TIPO_LABEL: Record<string, string> = {
  cpf:              "CPF",
  cnpj:             "CNPJ",
  telefone:         "Telefone",
  email:            "E-mail",
  chave_aleatoria:  "Chave aleatória",
};

function buildPixImgUrl(pixImagem: string, apiBase: string) {
  if (!pixImagem) return "";
  if (pixImagem.startsWith("http")) return pixImagem;
  const base = apiBase.replace("/api", "");
  return `${base}${pixImagem}`;
}

export default function PixModal({
  visible, onClose, pixChave, pixTipo, pixImagem, nomeMotorista, valor, apiBase = "",
}: Props) {
  const [copied, setCopied] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const temChave = Boolean(pixChave);
  const temImagem = Boolean(pixImagem);
  const temAlguma = temChave || temImagem;

  const handleCopy = async () => {
    if (!pixChave) return;
    await Clipboard.setStringAsync(pixChave);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const imgUrl = pixImagem ? buildPixImgUrl(pixImagem, apiBase) : "";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />

          <Text style={s.title}>💸 Receber pagamento</Text>
          <Text style={s.subtitle}>Mostre ao cliente para pagar via PIX</Text>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {!temAlguma ? (
              <View style={s.noPix}>
                <Text style={s.noPixIcon}>🔑</Text>
                <Text style={s.noPixTxt}>Chave PIX não configurada</Text>
                <Text style={s.noPixSub}>
                  Acesse Perfil → PIX para cadastrar sua chave ou imagem do seu banco
                </Text>
              </View>
            ) : (
              <>
                {nomeMotorista && (
                  <View style={s.nomeBox}>
                    <Text style={s.nomeLabel}>Destinatário</Text>
                    <Text style={s.nomeVal}>{nomeMotorista}</Text>
                    {valor != null && valor > 0 && (
                      <Text style={s.valorVal}>
                        R$ {valor.toFixed(2).replace(".", ",")}
                      </Text>
                    )}
                  </View>
                )}

                {/* PIX: imagem do banco tem prioridade; QR gerado só aparece se não há imagem */}
                {temImagem && imgUrl ? (
                  <View style={s.section}>
                    <Text style={s.sectionLabel}>QR Code do Banco</Text>
                    <View style={s.imgWrap}>
                      {imgLoading && !imgError && (
                        <ActivityIndicator color="#10B981" style={{ position: "absolute" }} />
                      )}
                      {!imgError ? (
                        <Image
                          source={{ uri: imgUrl }}
                          style={s.pixImg}
                          resizeMode="contain"
                          onLoadStart={() => setImgLoading(true)}
                          onLoad={() => setImgLoading(false)}
                          onError={() => { setImgLoading(false); setImgError(true); }}
                        />
                      ) : (
                        <Text style={s.imgErr}>Não foi possível carregar a imagem</Text>
                      )}
                    </View>
                    {temChave && (
                      <TouchableOpacity
                        style={[s.copyBtn, copied && s.copyBtnDone]}
                        onPress={handleCopy}
                      >
                        <Text style={s.copyBtnTxt}>
                          {copied ? "✅ Copiado!" : "📋 Copiar chave PIX"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : temChave ? (
                  <View style={s.section}>
                    <Text style={s.sectionLabel}>
                      QR Code • {PIX_TIPO_LABEL[pixTipo || ""] || pixTipo}
                    </Text>
                    <View style={s.qrWrap}>
                      <QRCode
                        value={gerarPixQRCode(pixChave!, nomeMotorista || "GoTaxi Pro", "Brasil", valor)}
                        size={220}
                        backgroundColor="#FFFFFF"
                        color="#000000"
                      />
                    </View>
                    <TouchableOpacity
                      style={[s.copyBtn, copied && s.copyBtnDone]}
                      onPress={handleCopy}
                    >
                      <Text style={s.copyBtnTxt}>
                        {copied ? "✅ Copiado!" : "📋 Copiar chave PIX"}
                      </Text>
                    </TouchableOpacity>
                    <View style={s.chaveBox}>
                      <Text style={s.chaveLabel}>
                        {PIX_TIPO_LABEL[pixTipo || ""] || "Chave"}
                      </Text>
                      <Text style={s.chaveVal} numberOfLines={2} selectable>
                        {pixChave}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnTxt}>Fechar e voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#111", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: "92%", paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#333", alignSelf: "center", marginTop: 12, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: "900", color: "#FFF", textAlign: "center", marginTop: 12 },
  subtitle: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 4 },
  content: { padding: 20, gap: 20, paddingBottom: 10 },

  nomeBox: {
    backgroundColor: "#1A1A1A", borderRadius: 16, padding: 16,
    alignItems: "center", gap: 4,
  },
  nomeLabel: { fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 },
  nomeVal: { fontSize: 17, fontWeight: "800", color: "#FFF" },
  valorVal: { fontSize: 24, fontWeight: "900", color: "#10B981", marginTop: 4 },

  section: { alignItems: "center", gap: 14 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#555", textTransform: "uppercase", letterSpacing: 0.5, alignSelf: "flex-start" },

  qrWrap: {
    backgroundColor: "#FFF", borderRadius: 20, padding: 18,
    shadowColor: "#10B981", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },

  copyBtn: {
    backgroundColor: "#1A2A1A", borderWidth: 1.5, borderColor: "#10B981",
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28,
  },
  copyBtnDone: { backgroundColor: "#0A2A0A", borderColor: "#10B981" },
  copyBtnTxt: { fontSize: 14, fontWeight: "700", color: "#10B981" },

  chaveBox: { backgroundColor: "#1A1A1A", borderRadius: 14, padding: 14, width: "100%", gap: 4 },
  chaveLabel: { fontSize: 11, color: "#555", textTransform: "uppercase" },
  chaveVal: { fontSize: 14, color: "#CCC", fontWeight: "600" },

  imgWrap: {
    width: "100%", minHeight: 240, backgroundColor: "#1A1A1A",
    borderRadius: 20, overflow: "hidden", alignItems: "center", justifyContent: "center",
  },
  pixImg: { width: "100%", height: 280 },
  imgErr: { color: "#555", fontSize: 13 },

  noPix: { alignItems: "center", paddingVertical: 40, gap: 12 },
  noPixIcon: { fontSize: 48 },
  noPixTxt: { fontSize: 16, fontWeight: "700", color: "#555" },
  noPixSub: { fontSize: 13, color: "#333", textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },

  closeBtn: { marginHorizontal: 20, backgroundColor: "#222", borderRadius: 18, paddingVertical: 16, alignItems: "center" },
  closeBtnTxt: { fontSize: 15, fontWeight: "700", color: "#888" },
});
